import db from "./src/db/connection";

try {
  console.log("Memulai pembaruan QR Code ke versi pendek (8 karakter)...");

  // Ambil semua peserta
  const semuaPeserta = db.query("SELECT id, nama_anak FROM peserta").all() as {
    id: number;
    nama_anak: string;
  }[];

  console.log(`Memproses ${semuaPeserta.length} peserta.`);

  if (semuaPeserta.length > 0) {
    const updateStmt = db.prepare(
      "UPDATE peserta SET qr_code = ? WHERE id = ?",
    );

    const transaction = db.transaction((list) => {
      for (const peserta of list) {
        const shortQr = crypto.randomUUID().substring(0, 8);
        updateStmt.run(shortQr, peserta.id);
        console.log(`- QR pendek untuk: ${peserta.nama_anak} (${shortQr})`);
      }
    });

    transaction(semuaPeserta);
    console.log(
      "✅ Sukses memperbarui semua QR Code ke versi pendek (8 karakter)!",
    );
  }
} catch (error) {
  console.error("❌ Gagal migrasi QR Code:", error);
}
