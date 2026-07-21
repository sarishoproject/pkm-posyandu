import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler, Peserta, PesertaInput } from "@/types";

// GET /api/peserta — Ambil semua peserta
export const GET: NextRouteHandler = async () => {
  const pesertaList = db
    .query("SELECT * FROM peserta ORDER BY nama_anak ASC")
    .all();
  return NextResponse.json(pesertaList as Peserta[]);
};

// POST /api/peserta — Tambah peserta baru
export const POST: NextRouteHandler<
  Record<string, never>,
  Record<string, never>,
  PesertaInput
> = async (req) => {
  const body = await req.json();
  const { nik, nama_anak, nama_ibu, qr_code, status } = body;

  if (!nik || !nama_anak) {
    return NextResponse.json(
      { error: "Field 'nik' dan 'nama_anak' wajib diisi." },
      { status: 400 },
    );
  }

  try {
    const stmt = db.prepare(
      `INSERT INTO peserta (nik, nama_anak, nama_ibu, qr_code, status) 
       VALUES (?, ?, ?, ?, ?) RETURNING *`,
    );
    const newPeserta = stmt.get(
      nik,
      nama_anak,
      nama_ibu || null,
      qr_code || null,
      status || "aktif",
    ) as Peserta;

    return NextResponse.json(newPeserta, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "NIK atau QR Code sudah terdaftar." },
      { status: 409 },
    );
  }
};
