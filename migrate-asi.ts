import db from "./src/db/connection";

try {
  console.log("Menambahkan kolom asi ke tabel pendataan...");
  // Perintah SQL untuk menambahkan kolom baru
  db.exec(`ALTER TABLE pendataan ADD COLUMN asi TEXT DEFAULT 'tidak';`);
  console.log("✅ Migrasi sukses!");
} catch (error) {
  console.error("❌ Gagal migrasi:", error);
}
