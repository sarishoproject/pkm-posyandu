import * as fs from "node:fs";
import * as path from "node:path";
import app from "./app/api/index";

// ═══════════════════════════════════════════════════════════════════════
// EMBEDDED ASSETS — Mode Single File Executable
// ═══════════════════════════════════════════════════════════════════════

type EmbeddedAsset = {
  content: string;
  mime: string;
  isText: boolean;
};

// Deklarasi tipe global agar tidak perlu pakai `any`
declare global {
  // eslint-disable-next-line no-var
  var __EMBEDDED_ASSETS__: Record<string, EmbeddedAsset> | undefined;
}

// Akses variabel global yang sudah dideklarasikan tipenya
const _embedded = globalThis.__EMBEDDED_ASSETS__;

if (_embedded) {
  // ───────────────────────────────────────────────────────────────────
  // MODE: Single File Executable (Production)
  // Semua asset frontend sudah ter-embed di dalam binary
  // ───────────────────────────────────────────────────────────────────

  console.log(
    `[Server] Running in EMBEDDED mode (${Object.keys(_embedded).length} assets)`,
  );

  // Middleware: serve embedded assets
  app.use("/*", async (c, next) => {
    // Jangan intercept route API
    if (c.req.path.startsWith("/api")) {
      return next();
    }

    // Root "/" → serve index.html
    const urlPath = c.req.path === "/" ? "/index.html" : c.req.path;
    const asset = _embedded[urlPath.replace(/^\//, "")];

    if (asset) {
      const headers: Record<string, string> = {
        "Content-Type": asset.mime,
        // Cache statis selamanya (filename punya hash)
        "Cache-Control": "public, max-age=31536000, immutable",
      };

      if (asset.isText) {
        // Text: konten adalah string langsung
        return new Response(asset.content, { headers });
      }

      // Binary: konten adalah path ke embedded file
      // Bun.file() membaca dari virtual filesystem binary
      const file = Bun.file(asset.content);
      return new Response(file, { headers });
    }

    // File tidak ditemukan → lanjut ke handler berikutnya
    return next();
  });

  // Fallback: SPA routing → serve index.html
  app.notFound(async (c) => {
    const indexAsset = _embedded["index.html"];
    if (indexAsset) {
      return c.html(indexAsset.content);
    }
    return c.text("Not Found", 404);
  });
} else {
  // ───────────────────────────────────────────────────────────────────
  // MODE: Filesystem (Dev / Direct Run)
  // Frontend diserve dari dist/client/ di filesystem
  // ───────────────────────────────────────────────────────────────────

  const frontendDistPath = path.join(
    path.dirname(process.execPath),
    "dist/client",
  );

  if (!fs.existsSync(frontendDistPath)) {
    console.warn(
      `[Server] Direktori frontend tidak ditemukan: ${frontendDistPath}`,
    );
    console.warn(
      '[Server] Jalankan "bun run compile" atau "bun run build" terlebih dahulu.',
    );
  }

  app.use("/*", async (c, next) => {
    if (c.req.path.startsWith("/api")) {
      return next();
    }

    const urlPath = c.req.path === "/" ? "/index.html" : c.req.path;
    const filePath = path.join(frontendDistPath, urlPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const file = Bun.file(filePath);
      return new Response(file);
    }

    return next();
  });

  app.notFound(async (c) => {
    const indexPath = path.join(frontendDistPath, "index.html");
    try {
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, "utf-8");
        return c.html(content);
      }
    } catch (e) {
      console.error("[Server] Gagal membaca index.html:", e);
    }
    return c.text("Not Found", 404);
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Server Config
// ═══════════════════════════════════════════════════════════════════════

const port = Number(process.env.PORT) || 3000;
if (Number.isNaN(port) || port < 1 || port > 65535) {
  console.error(`[Server] PORT tidak valid: ${process.env.PORT}`);
  process.exit(1);
}

console.log(`Server starting on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
