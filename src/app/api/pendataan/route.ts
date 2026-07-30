import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler, PendataanInput } from "@/types";

// POST /api/pendataan — Input hasil pengukuran BB/TB/LILA dll
export const POST: NextRouteHandler<
  Record<string, never>,
  Record<string, never>,
  PendataanInput
> = async (req) => {
  const body = await req.json();
  const {
    peserta_id,
    tanggal_ukur,
    berat,
    tinggi,
    lila,
    lingkar_kepala,
    pitting_edema,
    cara_ukur,
    vita,
    kelas_ibu_balita,
    mbg,
  } = body;

  if (!peserta_id || !tanggal_ukur) {
    return NextResponse.json(
      { error: "Field 'peserta_id' dan 'tanggal_ukur' wajib diisi." },
      { status: 400 },
    );
  }

  const stmt = db.prepare(
    `INSERT INTO pendataan (
      peserta_id, tanggal_ukur, berat, tinggi, lila, lingkar_kepala, 
      pitting_edema, cara_ukur, vita, kelas_ibu_balita, mbg
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
  );

  const newPendataan = stmt.get(
    peserta_id,
    tanggal_ukur,
    berat || null,
    tinggi || null,
    lila || null,
    lingkar_kepala || null,
    pitting_edema || null,
    cara_ukur || null,
    vita || null,
    kelas_ibu_balita || null,
    mbg || null,
  );

  return NextResponse.json(newPendataan, { status: 201 });
};
