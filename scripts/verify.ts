import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// --- NATIVE BUN ANSI COLORS ---
const C = {
  green: (t: string) => `\x1b[32m${t}\x1b[0m`,
  red: (t: string) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
  gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
  bold: (t: string) => `\x1b[1m${t}\x1b[0m`,
  dim: (t: string) => `\x1b[2m${t}\x1b[0m`,
};

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

interface TaskResult {
  output: string;
  success: boolean;
}

// --- RUNNER DENGAN ANIMASI LOADING ---
async function runTask(name: string, cmd: string[]): Promise<TaskResult> {
  const start = performance.now();
  let frame = 0;

  // Mulai spinner
  process.stdout.write(
    `${C.gray(spinnerFrames[frame])} ${C.dim(`Running ${name}...`)}`,
  );
  const interval = setInterval(() => {
    frame = (frame + 1) % spinnerFrames.length;
    process.stdout.write(
      `\r${C.gray(spinnerFrames[frame])} ${C.dim(`Running ${name}...`)}`,
    );
  }, 80);

  try {
    const proc = Bun.spawn(cmd, {
      stdout: "pipe",
      stderr: "pipe",
      cwd: process.cwd(),
    });

    const exitCode = await proc.exited;
    clearInterval(interval); // Hentikan spinner

    const duration = Math.round(performance.now() - start);
    const timeStr = C.gray(`${duration}ms`);

    // Tangkap output error jika ada
    const stderr = await new Response(proc.stderr).text();
    const stdout = await new Response(proc.stdout).text();
    const output = stderr.trim() || stdout.trim();

    if (exitCode === 0) {
      // Sukses: overwrite baris spinner dengan teks sukses
      process.stdout.write(
        `\r${C.green("✓")} ${C.bold(name)} ${C.dim("passed")} ${timeStr.padStart(10, " ")}\n`,
      );
      return { success: true, output: "" };
    } else {
      // Gagal: overwrite baris spinner dengan teks gagal
      process.stdout.write(
        `\r${C.red("✗")} ${C.bold(name)} ${C.red("failed")} ${timeStr}\n`,
      );
      return { success: false, output };
    }
  } catch (e) {
    clearInterval(interval);
    const duration = Math.round(performance.now() - start);
    process.stdout.write(
      `\r${C.red("✗")} ${C.bold(name)} ${C.red("crashed")} ${C.gray(`${duration}ms`)}\n`,
    );
    return { success: false, output: (e as Error).message };
  }
}

// --- CORE VERIFICATION LOGIC ---
export async function runVerification(): Promise<boolean> {
  console.log(C.bold(C.cyan("\n🔍 Memulai Verifikasi Pre-Commit\n")));

  let hasError = false;
  const warnings: string[] = [];

  // 1. Biome CI
  const biomeRes = await runTask("Biome CI (Lint & Format)", [
    "bun",
    "x",
    "biome",
    "ci",
  ]);
  if (!biomeRes.success) {
    hasError = true;
    console.log(C.red("   └── Detail Error Biome:"));
    biomeRes.output
      .split("\n")
      .slice(0, 10)
      .forEach((line) => {
        console.log(C.red(`       ${line}`));
      }); // Batasin 10 baris agar tidak terlalu panjang
  }

  // 2. TypeScript Check
  const tscRes = await runTask("TypeScript Type Check (tsc -b)", [
    "bun",
    "x",
    "tsc",
    "-b",
  ]);
  if (!tscRes.success) {
    hasError = true;
    console.log(C.red("   └── Detail Error TypeScript:"));
    tscRes.output
      .split("\n")
      .slice(0, 10)
      .forEach((line) => {
        console.log(C.red(`       ${line}`));
      });
  }

  // Ambil staged files
  const stagedFilesProc = Bun.spawnSync(
    ["git", "diff", "--cached", "--name-only"],
    { stdout: "pipe" },
  );
  const stagedFiles = new TextDecoder()
    .decode(stagedFilesProc.stdout)
    .split("\n")
    .filter(Boolean);

  if (stagedFiles.length > 0) {
    // 3. Cek file fix yang dilarang diubah sembarangan
    const protectedFiles = [
      "package.json",
      "biome.json",
      "tsconfig.json",
      "tsconfig.app.json",
      "tsconfig.node.json",
      "vite.config.ts",
      "components.json",
      ".gitignore",
      "scripts/compile.ts",
      "scripts/commit.ts",
      "src/server.ts",
      "src/db/connection.ts",
      "src/app/api/index.ts",
      "src/lib/classes/server.ts",
      "src/types/raw.d.ts",
    ];

    const protectedModified = stagedFiles.filter((f) =>
      protectedFiles.includes(f),
    );
    if (protectedModified.length > 0) {
      warnings.push(
        `Anda mengubah file fix: ${C.yellow(protectedModified.join(", "))}. Pastikan sudah konfirmasi di grup!`,
      );
    }

    // 4. Cek file auto-generated yang tidak boleh diedit manual
    if (stagedFiles.includes("src/routeTree.gen.ts")) {
      warnings.push(
        `Anda mengedit file auto-generated: ${C.yellow("src/routeTree.gen.ts")}. Biarkan ter-generate oleh Vite.`,
      );
    }

    const uiModified = stagedFiles.filter((f) =>
      f.startsWith("src/components/ui/"),
    );
    if (uiModified.length > 0) {
      warnings.push(
        `Anda mengedit komponen Shadcn manual: ${C.yellow(uiModified.join(", "))}. Gunakan CLI (bunx shadcn add).`,
      );
    }

    // 5. Cek file .sql yang belum terdaftar di schemaOrder
    const schemaIndexPath = join(process.cwd(), "src/db/schema/index.ts");
    const schemaDirPath = join(process.cwd(), "src/db/schema");

    if (existsSync(schemaIndexPath) && existsSync(schemaDirPath)) {
      const schemaIndex = readFileSync(schemaIndexPath, "utf-8");
      const sqlFiles = readdirSync(schemaDirPath).filter((f) =>
        f.endsWith(".sql"),
      );
      const unregistered = sqlFiles.filter((f) => !schemaIndex.includes(f));
      if (unregistered.length > 0) {
        hasError = true;
        console.log(`\n${C.red("✗")} ${C.bold("SQL Schema Check")}`);
        console.log(
          C.red(
            `   └── File .sql belum terdaftar di schemaOrder: ${unregistered.join(", ")}`,
          ),
        );
      }
    }
  }

  // Print Warnings
  if (warnings.length > 0) {
    console.log(C.bold(C.yellow("\n⚠️  Peringatan:")));
    warnings.forEach((w) => {
      console.log(`   ${C.yellow("!")} ${w}`);
    });
  }

  // Summary Line
  console.log(
    C.bold(C.gray("\n---------------------------------------------------")),
  );
  if (hasError) {
    console.log(
      `${C.red("✗")} ${C.bold(C.red("Verifikasi GAGAL!"))} ${C.gray("Commit dibatalkan.")}`,
    );
    console.log(
      C.gray(
        "💡 Tips: Jika ingin membatalkan staging, jalankan 'git reset HEAD .'",
      ),
    );
    return false;
  } else {
    console.log(
      `${C.green("✓")} ${C.bold(C.green("Semua verifikasi lulus!"))} ${C.gray("Siap untuk commit.")}`,
    );
    return true;
  }
}

// Jalankan jika dieksekusi langsung (bun run verify)
if (import.meta.main) {
  const success = await runVerification();
  process.exit(success ? 0 : 1);
}
