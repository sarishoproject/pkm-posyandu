import { join } from "node:path";
import { createInterface } from "node:readline";

// --- TINY TUI HELPERS ---
const rl = createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query: string): Promise<string> =>
  new Promise((resolve) => rl.question(query, resolve));

async function promptYesNo(
  question: string,
  defaultValue = true,
): Promise<boolean> {
  const defaultText = defaultValue ? "Y/n" : "y/N";
  while (true) {
    const ans = (await prompt(`${question} (${defaultText}): `))
      .trim()
      .toLowerCase();
    if (ans === "") return defaultValue;
    if (ans === "y" || ans === "yes") return true;
    if (ans === "n" || ans === "no") return false;
    console.log("❌ Input tidak valid. Masukkan y atau n.");
  }
}

// --- GIT HELPER ---
function runGit(args: string[], cwd = process.cwd()): string {
  const proc = Bun.spawnSync(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (proc.exitCode !== 0) {
    const err = new TextDecoder().decode(proc.stderr);
    throw new Error(`Git command failed: git ${args.join(" ")}\n${err}`);
  }
  return new TextDecoder().decode(proc.stdout).trim();
}

// --- AUTH HELPER ---
const AUTH_FILE = join(process.cwd(), ".commit-auth.json");

async function getApiKey(): Promise<string> {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

  if (await Bun.file(AUTH_FILE).exists()) {
    const auth = await Bun.file(AUTH_FILE).json();
    if (auth.apiKey) return auth.apiKey;
  }

  console.log("🔑 Google Gemini API Key tidak ditemukan.");
  const key = (await prompt("👉 Masukkan API Key: ")).trim();
  if (!key) {
    console.log("❌ API Key wajib diisi. Dibatalkan.");
    process.exit(1);
  }
  await Bun.write(AUTH_FILE, JSON.stringify({ apiKey: key }));
  console.log(
    "✅ API Key disimpan di .commit-auth.json (PASTIKAN FILE INI DI-GITIGNORE!)\n",
  );
  return key;
}

// --- AI MANAGER ---
interface AIResponse {
  bump: "major" | "minor" | "patch" | "none";
  changelog: string;
  checkResult: {
    isSafe: boolean;
    message: string;
  };
  commitMessage: string;
}

async function generateCommitDetails(
  diff: string,
  apiKey: string,
  model = "gemini-3.1-flash-lite",
): Promise<AIResponse> {
  const prompt = `
        You are a Senior DevOps Engineer. Analyze the following 'git diff'. 
        You MUST return a valid JSON object ONLY. Do not wrap it in markdown code blocks.
        
        JSON Structure:
        {
          "commitMessage": "type(scope): description",
          "changelog": "String. Multi-line string with bullet points.",
          "bump": "major" | "minor" | "patch" | "none",
          "checkResult": {
            "isSafe": boolean,
            "message": "Status message or warning about secrets found. Empty if safe."
          }
        }

        Rules for 'checkResult':
        - Scan the DIFF for accidental leaks of secrets (e.g., API keys, passwords, private keys, .env values, tokens).
        - If any secret is found, set 'isSafe' to false and provide a descriptive warning in 'message'.
        - If the changes look safe, set 'isSafe' to true.

        Rules for 'changelog':
        - EVERY line MUST start with a relevant emoji (e.g., ✨, 🚀, 🛠️, 📝, 📦, 🎨, ⚡️, ⚙️, 📖, 📜, 🏷️, 🧹, 🐛).
        - Format: "- [Emoji] [Description]"
        - If multiple files/features changed, describe them in detail across multiple lines (separated by \\n).
        - Do not be generic; explain WHAT changed and WHY.

        Rules for 'commitMessage':
        - Follow Conventional Commits (e.g., feat: ..., fix: ..., refactor: ...).

        DIFF:
        ${diff.substring(0, 30000)} ${diff.length > 30000 ? "...(truncated)" : ""}
        `;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Respon AI kosong.");

  return JSON.parse(
    text
      .replace(/^```json\s*/g, "")
      .replace(/^```\s*/g, "")
      .replace(/\s*```$/g, "")
      .trim(),
  );
}

// --- VERSION & CHANGELOG HELPER ---
function getNewVersion(oldVer: string, bumpType: string): string {
  const match = oldVer.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (!match) return oldVer;

  let major = parseInt(match[1], 10),
    minor = parseInt(match[2], 10),
    patch = parseInt(match[3], 10);
  const suffix = match[4] || "";

  if (bumpType === "major") {
    major++;
    minor = 0;
    patch = 0;
  } else if (bumpType === "minor") {
    minor++;
    patch = 0;
  } else if (bumpType === "patch") {
    patch++;
  } else return oldVer;

  return `${major}.${minor}.${patch}${suffix}`;
}

async function updateChangelog(newVer: string | null, changelogText: string) {
  const changelogPath = join(process.cwd(), "CHANGELOG.md");
  let currentContent = "# Changelog\n";
  if (await Bun.file(changelogPath).exists()) {
    currentContent = await Bun.file(changelogPath).text();
  }

  const date = new Date().toISOString().split("T")[0];
  const versionHeader = newVer ? `## [${newVer}] - ${date}` : `### [${date}]`;

  const lines = changelogText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => (l.startsWith("-") ? l : `- ${l}`));
  const entry = `\n${versionHeader}\n${lines.join("\n")}\n`;

  const header = "# Changelog\n";
  let newContent = "";
  if (currentContent.includes(header)) {
    newContent = currentContent.replace(header, `${header}${entry}`);
  } else {
    newContent = `${header}${entry}${currentContent.replace("# Changelog", "")}`;
  }

  await Bun.write(changelogPath, `${newContent.trim()}\n`);
}

// --- MAIN EXECUTION ---
async function main() {
  console.log("🤖 AI AUTO COMMIT (Lightweight Digester)\n");

  const apiKey = await getApiKey();

  // 1. Stage & Get Diff
  runGit(["add", "."]);
  const rawDiff = runGit(["diff", "--cached", "-U0"]);

  if (!rawDiff.trim()) {
    console.log("✅ Tidak ada perubahan untuk di-commit.");
    rl.close();
    process.exit(0);
  }

  const cleanDiff = rawDiff
    .split("\n")
    .filter((line) => {
      if (line.startsWith("diff --git")) return true;
      if (line.startsWith("+") && !line.startsWith("+++")) return true;
      if (line.startsWith("-") && !line.startsWith("---")) return true;
      return false;
    })
    .join("\n");

  if (!cleanDiff.trim()) {
    console.log(
      "✅ Tidak ada perubahan kode yang berarti (hanya whitespace/meta).",
    );
    rl.close();
    process.exit(0);
  }

  // 2. Consult AI
  console.log("🧠 Mengonsultasikan ke Gemini AI...");
  const result = await generateCommitDetails(cleanDiff, apiKey);

  console.log("\n📝 AI Proposal:");
  console.log(`   ${"Message".padEnd(8)}: ${result.commitMessage}`);
  console.log(`   ${"Bump".padEnd(8)}: ${result.bump.toUpperCase()}`);
  console.log(
    `   ${"Log".padEnd(8)}: \n${result.changelog
      .split("\n")
      .map((l) => `     ${l}`)
      .join("\n")}\n`,
  );

  // 3. Security Check
  if (!result.checkResult.isSafe) {
    console.log(`🛡️  SECURITY WARNING: ${result.checkResult.message}`);
    const proceed = await promptYesNo(
      "⚠️  SENSITIVE DATA DETECTED. Lanjutkan juga?",
      false,
    );
    if (!proceed) {
      console.log("❌ Dibatalkan demi keamanan.");
      rl.close();
      process.exit(1);
    }
  }

  // 4. Confirm
  const confirm = await promptYesNo("🚀 Execute & commit perubahan ini?", true);
  if (!confirm) {
    console.log("Dibatalkan.");
    rl.close();
    process.exit(0);
  }

  // 5. Update Version
  let newVer: string | null = null;
  if (result.bump !== "none") {
    const pkgPath = join(process.cwd(), "package.json");
    const pkg = await Bun.file(pkgPath).json();
    newVer = getNewVersion(pkg.version || "0.0.0", result.bump);
    pkg.version = newVer;
    await Bun.write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`✅ package.json diupdate ke v${newVer}`);
    runGit(["add", "package.json"]);
  }

  // 6. Update Changelog
  await updateChangelog(newVer, result.changelog);
  console.log("✅ CHANGELOG.md diupdate");
  runGit(["add", "CHANGELOG.md"]);

  // 7. Commit & Tag
  runGit(["commit", "-m", result.commitMessage]);
  if (newVer) {
    runGit(["tag", `v${newVer}`]);
    console.log(`🏷️  Tag v${newVer} dibuat`);
  }

  // 8. Push
  const shouldPush = await promptYesNo("🌐 Push ke remote repository?", true);
  if (shouldPush) {
    try {
      const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
      console.log(`Mendorong ke origin/${branch}...`);
      runGit(["push", "origin", "HEAD"]);
      if (newVer) runGit(["push", "origin", `v${newVer}`]);
      console.log("✅ Push sukses!");
    } catch (e) {
      console.log(`❌ Push gagal: ${(e as Error).message}`);
    }
  }

  console.log("\n🎉 ALL SET! Selesai.");
  rl.close();
}

main().catch((err) => {
  console.error("❌ Terjadi error:", err.message);
  rl.close();
  process.exit(1);
});
