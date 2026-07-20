import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { $ } from "bun";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    target: {
      type: "string",
      default: "bun-linux-arm64",
    },
  },
  strict: true,
  allowPositionals: true,
});

const target = values.target;

if (!target) {
  console.error("❌ Target kompilasi tidak boleh kosong.");
  process.exit(1);
}

console.log(`🚀 Starting compilation for target: ${target}`);

// 1. Build frontend
console.log("📦 Building Vite frontend...");
try {
  await $`bun run vite build --outDir dist/client --emptyOutDir`;
} catch (e) {
  console.error("❌ Build Vite frontend gagal:", e);
  process.exit(1);
}

// 2. Build server dengan Vite
console.log("⚙️ Building Vite server (SSR)...");
try {
  await $`bun run vite build --ssr src/server.ts --outDir dist/server --emptyOutDir`;
} catch (e) {
  console.error("❌ Build Vite server gagal:", e);
  process.exit(1);
}

// 3. Compile standalone binary
console.log(`🔨 Compiling binary for ${target}...`);
try {
  const compileResult =
    await $`bun build --compile --target=${target} --outfile=build/app-${target} ./dist/server/server.js`;

  if (compileResult.exitCode === 0) {
    console.log(
      `✅ Compilation successful! Binary saved to build/app-${target}`,
    );
  } else {
    console.error(
      `❌ Compilation failed with exit code ${compileResult.exitCode}.`,
    );
    process.exit(compileResult.exitCode);
  }
} catch (e) {
  console.error("❌ Compilation gagal:", e);
  process.exit(1);
}

// 4. Pindahkan folder frontend (dist/client) ke dalam folder build
console.log("📂 Copying frontend assets to build directory...");
const srcClientPath = resolve(process.cwd(), "dist/client");
const destClientPath = resolve(process.cwd(), "build/dist/client");

try {
  // Hapus dulu jika ada folder lama
  if (existsSync(destClientPath)) {
    rmSync(destClientPath, { recursive: true, force: true });
  }
  // Copy folder frontend ke dalam build/dist/client
  cpSync(srcClientPath, destClientPath, { recursive: true });
  console.log("✅ Frontend assets copied successfully!");
} catch (e) {
  console.error("❌ Gagal mengcopy frontend assets:", e);
  process.exit(1);
}
