// scripts/compile.ts

import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, sep } from "node:path";
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

const defineArg = 'process.env.NODE_ENV:"production"';

try {
  await $`bun build --compile --target=${target} --minify --bytecode --sourcemap=none --define ${defineArg} --outfile=build/app-${target} ./dist/entry.ts`;
} catch (e) {
  console.error("❌ Compilation gagal:", e);
  process.exit(1);
}

// ─── Print Summary ──────────────────────────────────────────────────
// FIX: Cek apakah target windows, jika ya tambahkan .exe
const binaryName = target.includes("windows")
  ? `app-${target}.exe`
  : `app-${target}`;
const binaryPath = join(cwd, "build", binaryName);

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
  console.log(`   Binary  : build/${binaryName}`);
  console.log(`   Size    : ${sizeMB} MB`);
  console.log(`   Target  : ${target}`);
  console.log(`   Features: minified + bytecode + embedded assets`);
  console.log("─────────────────────────────────────────────────");
  console.log("");
  console.log("   Menjalankan:");
  console.log(`   ./build/${binaryName}`);
  console.log("");
  console.log("   Dengan config custom:");
  console.log(`   PORT=8080 DB_PATH=/data/posyandu.db ./build/${binaryName}`);
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

  // Scan semua file di dist/client/
  const files: string[] = [];

  function scan(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        // Skip direktori internal Vite
        if (entry === ".vite") continue;
        scan(full);
      } else {
        // Skip source maps (tidak perlu di production)
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

  // Kategorisasi: text vs binary
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
    // Path relatif dari dist/_embeds.ts ke dist/client/file
    const importPath = `../dist/client/${file}`;

    if (isText) {
      // Text: import dengan type:"text" → konten langsung jadi string
      textImports.push(
        `import ${varName} from "${importPath}" with { type: "text" };`,
      );
      entries.push(
        `  ${JSON.stringify(file)}: { content: ${varName}, mime: ${JSON.stringify(mime)}, isText: true }`,
      );
      textCount++;
    } else {
      // Binary: import tanpa attribute → Bun embed raw bytes, return path
      // Path digunakan dengan Bun.file(path) saat runtime
      binaryImports.push(`import ${varName} from "${importPath}";`);
      entries.push(
        `  ${JSON.stringify(file)}: { content: ${varName}, mime: ${JSON.stringify(mime)}, isText: false }`,
      );
      binaryCount++;
    }
  });

  // Rakit kode
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
