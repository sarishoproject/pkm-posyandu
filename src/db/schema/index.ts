import pendataanSchema from "./pendataan.sql?raw";
import pesertaSchema from "./peserta.sql?raw";
/**
 * Daftar schema yang sudah ter-embed ke dalam kode.
 * Ini memastikan binary tunggal tidak butuh file .sql eksternal.
 */

export const schemaOrder = [
  { name: "peserta.sql", content: pesertaSchema },
  { name: "pendataan.sql", content: pendataanSchema },
];

/**
 * Validasi registry tidak lagi membaca filesystem.
 * Dibuat kosong/pengingat agar developer tetap mendaftarkan file di array atas.
 */
export function validateSchemaRegistry(): void {
  // Schema kini di-hardcode via import, jadi tidak perlu baca filesystem lagi.
  return;
}
