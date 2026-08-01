// scripts/compile.ts

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, relative, sep } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { $ } from "bun";

const getHostTarget = () => {
  const platform = process.platform;
  const arch = process.arch;
  const platMap: Record<string, string> = {
    win32: "windows",
    darwin: "darwin",
    linux: "linux",
  };
  const plat = platMap[platform] || "linux";
  return `bun-${plat}-${arch}`;
};

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    target: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

let target = values.target;

if (!target) {
  console.log("📋 Pilih target platform compile:");
  console.log("1) Windows (bun-windows-x64-baseline)");
  console.log("2) Linux (bun-linux-x64-baseline)");
  console.log("3) Linux ARM64 (bun-linux-arm64)");
  console.log("4) macOS (bun-darwin-x64)");
  console.log("5) macOS ARM64 (bun-darwin-arm64)");
  console.log(`6) Gunakan default host (${getHostTarget()})`);

  const rl = createInterface({ input, output });
  const answer = (
    await rl.question("\nMasukkan pilihan (1-6) [Default: 6]: ")
  ).trim();
  rl.close();

  if (answer === "1") {
    target = "bun-windows-x64-baseline";
  } else if (answer === "2") {
    target = "bun-linux-x64-baseline";
  } else if (answer === "3") {
    target = "bun-linux-arm64";
  } else if (answer === "4") {
    target = "bun-darwin-x64";
  } else if (answer === "5") {
    target = "bun-darwin-arm64";
  } else {
    target = getHostTarget();
  }
}

const cwd = process.cwd();

console.log(`🚀 Compiling for target: ${target}\n`);

// ─── Step 1: Build Frontend ─────────────────────────────────────────
console.log("📦 [1/5] Building Vite frontend...");
try {
  await $`bun run vite build --outDir dist/client --emptyOutDir`;
} catch (e) {
  console.error("❌ Build Vite frontend gagal:", e);
  process.exit(1);
}

// ─── Step 2: Build Server (SSR) ─────────────────────────────────────
console.log("⚙️  [2/5] Building Vite server (SSR)...");
try {
  await $`bun run vite build --ssr src/server.ts --outDir dist/server --emptyOutDir`;
} catch (e) {
  console.error("❌ Build Vite server gagal:", e);
  process.exit(1);
}

// ─── Step 3: Generate Embedded Assets ───────────────────────────────
console.log("📝 [3/5] Generating embedded assets...");
const isWindows = target.includes("windows");
const mkcertName = isWindows ? "mkcert.exe" : "mkcert";

// Cari di cache global atau di folder build
const globalCachePath = join(homedir(), ".vite-plugin-mkcert", mkcertName);
const localBuildPath = join(cwd, "build", mkcertName);

let mkcertSrc = "";
if (existsSync(globalCachePath)) {
  mkcertSrc = globalCachePath;
} else if (existsSync(localBuildPath)) {
  mkcertSrc = localBuildPath;
}

const mkcertDest = join(cwd, "dist/client", mkcertName);
if (mkcertSrc) {
  copyFileSync(mkcertSrc, mkcertDest);
  console.log(
    `   📎 ${mkcertName} copied from ${mkcertSrc === globalCachePath ? "global cache" : "build folder"} to embed in binary`,
  );
} else {
  console.log(
    `   ⚠️  ${mkcertName} tidak ditemukan di global cache maupun build/ folder. Binary akan di-compile TANPA mkcert.`,
  );
}
generateEmbeds(join(cwd, "dist/client"), join(cwd, "dist/_embeds.ts"));

// ─── Step 4: Generate Entry Point ───────────────────────────────────
console.log("🔗 [4/5] Creating entry point...");
const entryCode = [
  "// AUTO-GENERATED entry point — DO NOT EDIT",
  "// Imports _embeds first (sets globalThis.__EMBEDDED_ASSETS__)",
  "// Then imports server — yang langsung memulai HTTP server via side-effect",
  'import "./_embeds.ts";',
  'import "./server/server.js";',
  "",
  "// Trigger keep-alive agar binary tidak exit setelah server start",
  'console.log("[entry] Server module loaded.");',
  "",
].join("\n");
writeFileSync(join(cwd, "dist/entry.ts"), entryCode);

// ─── Step 5: Compile Binary ─────────────────────────────────────────
console.log(`🔨 [5/5] Compiling binary for ${target}...`);
console.log("   Flags: --minify --bytecode --sourcemap=none");

mkdirSync(join(cwd, "build"), { recursive: true });

const binaryExt = isWindows ? ".exe" : "";
const outputBase = `build/pkm-posyandu-${target}${binaryExt}`;

const defineArg = 'process.env.NODE_ENV:"production"';

const MAX_RETRIES = 3;
let lastError: Error | null = null;

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  try {
    if (attempt > 1) {
      console.log(`   🔄 Retry attempt ${attempt}/${MAX_RETRIES}...`);
    }
    console.log(`   ⏳ Compiling (attempt ${attempt})...`);

    const env = {
      ...process.env,
      BUN_DOWNLOAD_TIMEOUT: "600",
      BUN_CONFIG_TIMEOUT: "600000",
    };

    await $`bun build --compile --target=${target} --minify --bytecode --sourcemap=none --define ${defineArg} --outfile=${outputBase} ./dist/entry.ts`.env(
      env,
    );

    lastError = null;
    console.log(`   ✅ Compile berhasil pada attempt ${attempt}`);
    break;
    // biome-ignore lint/suspicious/noExplicitAny: <explanationa>
  } catch (e: any) {
    lastError = e as Error;

    const errMsg = (e?.stderr?.toString() || e?.message || "").toLowerCase();
    console.error(`   ⚠️  Attempt ${attempt} gagal: ${errMsg.split("\n")[0]}`);

    const isNetworkError =
      errMsg.includes("timeout") ||
      errMsg.includes("download") ||
      errMsg.includes("extract") ||
      errMsg.includes("incomplete") ||
      errMsg.includes("fetch failed");

    if (isNetworkError) {
      console.log(
        `   💡 Masalah download/ekstraksi terdeteksi. Membersihkan cache...`,
      );
      try {
        if (existsSync(outputBase)) rmSync(outputBase, { force: true });

        const bunInstallCache = join(homedir(), ".bun", "install", "cache");
        if (existsSync(bunInstallCache)) {
          console.log(`   🧹 Menghapus cache: ${bunInstallCache}`);
          rmSync(bunInstallCache, { recursive: true, force: true });
        }

        const bunBinCache = join(homedir(), ".bun", "bin");
        if (existsSync(bunBinCache)) {
          console.log(`   🧹 Menghapus bin cache: ${bunBinCache}`);
          for (const f of readdirSync(bunBinCache)) {
            if (f.startsWith("bun-") && f !== "bun" && f !== "bun.exe") {
              rmSync(join(bunBinCache, f), { force: true });
            }
          }
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 3000));
      continue;
    }

    console.error("❌ Compilation gagal:", e);
    process.exit(1);
  }
}

if (lastError) {
  console.error("\n❌ Compilation gagal setelah semua retry:", lastError);
  console.error("\n💡 Tips:");
  console.error("   1. Coba jalankan lagi (mungkin masalah network sementara)");
  console.error(
    "   2. Download manual binary target dari https://github.com/oven-sh/bun/releases",
  );
  console.error("   3. Gunakan VPN jika koneksi ke GitHub lambat");
  process.exit(1);
}

// ─── Print Summary ──────────────────────────────────────────────────
const binaryPath = outputBase;

// Hapus file sourcemap yang tidak diperlukan (jika ada)
const mapPath = join(cwd, "build", "entry.js.map");
if (existsSync(mapPath)) {
  rmSync(mapPath, { force: true });
}

if (existsSync(binaryPath)) {
  const binarySize = statSync(binaryPath).size;
  const sizeMB = (binarySize / 1024 / 1024).toFixed(2);
  console.log("");
  console.log("✅ ─────────────────────────────────────────────");
  console.log(`   Binary  : ${outputBase}`);
  console.log(`   Size    : ${sizeMB} MB`);
  console.log(`   Target  : ${target}`);
  console.log(`   Features: minified + bytecode + embedded assets`);
  console.log("─────────────────────────────────────────────────");
  console.log("");
  console.log("   Menjalankan:");
  if (isWindows) {
    console.log(`   .\\${outputBase}`);
  } else {
    console.log(`   chmod +x ${outputBase} && ./${outputBase}`);
  }
  console.log("");
} else {
  console.error("❌ Binary tidak ditemukan di build/ setelah compile!");
  process.exit(1);
}

// ═════════════════════════════════════════════════════════════════════
// HELPER: Generate Embedded Assets File
// ═════════════════════════════════════════════════════════════════════

function generateEmbeds(distPath: string, outputPath: string) {
  if (!existsSync(distPath)) {
    console.error(`❌ dist/client tidak ditemukan: ${distPath}`);
    process.exit(1);
  }

  const files: string[] = [];

  function scan(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (entry === ".vite") continue;
        scan(full);
      } else {
        if (entry.endsWith(".map")) continue;
        files.push(relative(distPath, full).split(sep).join("/"));
      }
    }
  }

  scan(distPath);

  if (files.length === 0) {
    console.error("❌ Tidak ada file di dist/client/!");
    process.exit(1);
  }

  const TEXT_EXTS = [
    ".html",
    ".htm",
    ".css",
    ".js",
    ".mjs",
    ".svg",
    ".json",
    ".txt",
    ".xml",
  ];

  const MIME_TYPES: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".eot": "application/vnd.ms-fontobject",
    ".wasm": "application/wasm",
    ".exe": "application/octet-stream",
  };

  const textImports: string[] = [];
  const binaryImports: string[] = [];
  const entries: string[] = [];
  let textCount = 0;
  let binaryCount = 0;

  files.forEach((file, i) => {
    const ext = `.${(file.split(".").pop() || "").toLowerCase()}`;
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    const isText = TEXT_EXTS.includes(ext);
    const varName = `_a${i}`;
    const importPath = `../dist/client/${file}`;

    if (isText) {
      textImports.push(
        `import ${varName} from "${importPath}" with { type: "text" };`,
      );
      entries.push(
        `  ${JSON.stringify(file)}: { content: ${varName}, mime: ${JSON.stringify(mime)}, isText: true }`,
      );
      textCount++;
    } else {
      binaryImports.push(`import ${varName} from "${importPath}";`);
      entries.push(
        `  ${JSON.stringify(file)}: { content: ${varName}, mime: ${JSON.stringify(mime)}, isText: false }`,
      );
      binaryCount++;
    }
  });

  let code = "";
  code += "// AUTO-GENERATED by scripts/compile.ts — DO NOT EDIT\n";
  code += `// ${files.length} files embedded (${textCount} text, ${binaryCount} binary)\n`;
  code += "// File ini di-import oleh dist/entry.ts SEBELUM server.js\n";
  code +=
    "// sehingga globalThis.__EMBEDDED_ASSETS__ tersedia saat server start\n\n";

  if (textImports.length > 0) {
    code += "// ── Text Assets (html, css, js, svg, dll) ──\n";
    code += `${textImports.join("\n")}\n`;
  }

  if (binaryImports.length > 0) {
    code += "\n// ── Binary Assets (fonts, images, dll) ──\n";
    code += "// Import tanpa attribute → Bun embed raw bytes, return path\n";
    code += "// Gunakan Bun.file(path) untuk akses konten saat runtime\n";
    code += `${binaryImports.join("\n")}\n`;
  }

  code += "\n";
  code += "// ── Set global agar server.ts bisa akses ──\n";
  code += "(globalThis as any).__EMBEDDED_ASSETS__ = {\n";
  code += entries.join(",\n");
  code += "\n};\n";

  writeFileSync(outputPath, code);

  console.log(
    `   📎 ${files.length} assets embedded ` +
      `(${textCount} text, ${binaryCount} binary)`,
  );
}
