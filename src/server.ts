import * as fs from "node:fs";
import * as path from "node:path";
import app from "./app/api/index";

// Path ke hasil build frontend
// process.execPath akan mengembalikan lokasi file binary yang sebenarnya
const frontendDistPath = path.join(
  path.dirname(process.execPath),
  "dist/client",
);

if (!fs.existsSync(frontendDistPath)) {
  console.warn(
    `[Server] Direktori frontend tidak ditemukan: ${frontendDistPath}`,
  );
  console.warn(
    '[Server] Jalankan "bun run compile" terlebih dahulu sebelum menjalankan binary.',
  );
}

// Custom middleware untuk men-serve static file menggunakan Bun.file
// Ini jauh lebih stabil saat di-compile menjadi binary tunggal
app.use("/*", async (c, next) => {
  // Jangan intercept route API
  if (c.req.path.startsWith("/api")) {
    return next();
  }

  // Jika request root "/", serve index.html
  const urlPath = c.req.path === "/" ? "/index.html" : c.req.path;
  const filePath = path.join(frontendDistPath, urlPath);

  // Cek apakah file tersebut benar-benar ada di sistem
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const file = Bun.file(filePath);
    // Bun.file otomatis akan mengembalikan MIME type yang benar (application/javascript, text/css, dll)
    return new Response(file);
  }

  // Jika file tidak ada, lanjut ke handler berikutnya (notFound)
  return next();
});

// Fallback ke index.html untuk SPA routing (TanStack Router)
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

// Validasi PORT
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
