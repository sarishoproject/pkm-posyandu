import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler, PesertaInput } from "@/types";

// GET /api/peserta/:id — Ambil detail peserta beserta riwayat pendataannya
export const GET: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;

  const peserta = db.query("SELECT * FROM peserta WHERE id = ?").get(id);
  if (!peserta) {
    return NextResponse.json(
      { error: "Peserta tidak ditemukan." },
      { status: 404 },
    );
  }

  // Ambil riwayat pendataan anak ini
  const riwayat = db
    .query(
      "SELECT * FROM pendataan WHERE peserta_id = ? ORDER BY tanggal_ukur DESC",
    )
    .all(id);

  return NextResponse.json({ ...peserta, riwayat });
};

// DELETE /api/peserta/:id — Hapus peserta
export const DELETE: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;
  const deleted = db
    .prepare("DELETE FROM peserta WHERE id = ? RETURNING *")
    .get(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Peserta tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: "Peserta berhasil dihapus." });
};

// PUT /api/peserta/:id — Update data peserta (Nama, NIK, ASI, dll)
export const PUT: NextRouteHandler<
  { id: string },
  Record<string, never>,
  Partial<PesertaInput> // Partial artinya field gak harus diisi semua
> = async (req) => {
  const { id } = req.params;
  const body = await req.json();

  // Cek apakah pesertanya ada
  const exists = db.query("SELECT * FROM peserta WHERE id = ?").get(id);
  if (!exists) {
    return NextResponse.json(
      { error: "Peserta tidak ditemukan." },
      { status: 404 },
    );
  }

  // Bangun query UPDATE dinamis (hanya update field yang dikirim frontend)
  const fields = Object.keys(body);
  if (fields.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada data untuk diupdate." },
      { status: 400 },
    );
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  // FIX TYPESCRIPT: Kasihtahu TS kalau nilainya pasti string atau null
  const values = fields.map(
    (field) => body[field as keyof PesertaInput] ?? null,
  ) as (string | null)[];

  const stmt = db.prepare(
    `UPDATE peserta SET ${setClause} WHERE id = ? RETURNING *`,
  );
  const updatedPeserta = stmt.get(...values, id);

  return NextResponse.json(updatedPeserta);
};
