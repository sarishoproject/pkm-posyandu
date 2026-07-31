// scripts/start.ts
import { existsSync } from "node:fs";
import { join } from "node:path";

const isWindows = process.platform === "win32";
const binaryName = isWindows ? "pkm-posyandu.exe" : "pkm-posyandu";
const buildDir = join(process.cwd(), "build");

// Cari binary di build/
const possiblePaths = [
  join(buildDir, binaryName),
  join(buildDir, `pkm-posyandu-bun-windows-x64.exe`),
  join(buildDir, `pkm-posyandu-bun-linux-x64`),
  join(buildDir, `pkm-posyandu-bun-linux-arm64`),
  join(buildDir, `pkm-posyandu-bun-darwin-x64`),
  join(buildDir, `pkm-posyandu-bun-darwin-arm64`),
];

const foundPath = possiblePaths.find((p) => existsSync(p));

if (!foundPath) {
  console.error("❌ Binary belum ada! Jalankan 'bun run compile' dulu.");
  process.exit(1);
}

console.log(`🚀 Menjalankan: ${foundPath}`);
const proc = Bun.spawn([foundPath], {
  stdio: ["inherit", "inherit", "inherit"],
});
const exitCode = await proc.exited;
process.exit(exitCode);
