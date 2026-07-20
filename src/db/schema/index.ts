import beratBadanSchema from "./berat_badan.sql?raw";
import usersSchema from "./users.sql?raw";

/**
 * Daftar schema yang sudah ter-embed ke dalam kode.
 * Ini memastikan binary tunggal tidak butuh file .sql eksternal.
 */
export const schemaOrder = [
  { name: "users.sql", content: usersSchema },
  { name: "berat_badan.sql", content: beratBadanSchema },
];

/**
 * Validasi registry tidak lagi membaca filesystem.
 * Dibuat kosong/pengingat agar developer tetap mendaftarkan file di array atas.
 */
export function validateSchemaRegistry(): void {
  // Schema kini di-hardcode via import, jadi tidak perlu baca filesystem lagi.
  return;
}
