import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler, Peserta, PesertaInput } from "@/types";

// GET /api/peserta — Ambil semua peserta
export const GET: NextRouteHandler = async () => {
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const pesertaList = db
    .query(`
      SELECT 
        p.*,
        EXISTS(
          SELECT 1 FROM pendataan d 
          WHERE d.peserta_id = p.id 
            AND strftime('%Y-%m', d.tanggal_ukur) = ?
        ) as sudah_diperiksa
      FROM peserta p
      ORDER BY p.nama_anak ASC
    `)
    .all(currentYearMonth);

  return NextResponse.json(pesertaList as any[]);
};

// POST /api/peserta — Tambah peserta baru
export const POST: NextRouteHandler<
  Record<string, never>,
  Record<string, never>,
  PesertaInput
> = async (req) => {
  const body = await req.json();
  const {
    nik,
    nama_anak,
    nama_ibu,
    status,
    jenis_kelamin,
    tanggal_lahir,
  } = body;

  if (!nik || !nama_anak) {
    return NextResponse.json(
      { error: "Field 'nik' dan 'nama_anak' wajib diisi." },
      { status: 400 },
    );
  }

  if (jenis_kelamin && !["Laki-laki", "Perempuan"].includes(jenis_kelamin)) {
    return NextResponse.json(
      { error: "Jenis kelamin harus 'Laki-laki' atau 'Perempuan'." },
      { status: 400 },
    );
  }
  const generatedQrCode = crypto.randomUUID();

  try {
    const stmt = db.prepare(
      `INSERT INTO peserta (nik, nama_anak, nama_ibu, qr_code, status , jenis_kelamin , tanggal_lahir) 
       VALUES (?, ?, ?, ?, ? , ?, ?) RETURNING *`,
    );
    const newPeserta = stmt.get(
      nik,
      nama_anak,
      nama_ibu || null,
      generatedQrCode || null,
      status || "aktif",
      jenis_kelamin || null,
      tanggal_lahir || null,
    ) as Peserta;

    return NextResponse.json(newPeserta, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "NIK atau QR Code sudah terdaftar." },
      { status: 409 },
    );
  }
};
