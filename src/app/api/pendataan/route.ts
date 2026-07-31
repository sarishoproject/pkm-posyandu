import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler, PendataanInput } from "@/types";

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
    asi_bulan_ini,
  } = body;

  if (!peserta_id || !tanggal_ukur) {
    return NextResponse.json(
      { error: "Field 'peserta_id' dan 'tanggal_ukur' wajib diisi." },
      { status: 400 },
    );
  }

  // 1. Simpan data pengukuran utama
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

  // 2. Jika ada input ASI, update ke tabel peserta berdasarkan umur bulan
  if (asi_bulan_ini && asi_bulan_ini.trim() !== "") {
    const peserta = db
      .prepare("SELECT tanggal_lahir FROM peserta WHERE id = ?")
      .get(peserta_id) as { tanggal_lahir: string } | undefined;

    if (peserta?.tanggal_lahir) {
      const birth = new Date(peserta.tanggal_lahir);
      const now = new Date();
      let months = (now.getFullYear() - birth.getFullYear()) * 12;
      months -= birth.getMonth();
      months += now.getMonth();
      if (now.getDate() < birth.getDate()) months--;

      const umurBulan = months < 0 ? 0 : months;

      if (umurBulan <= 6) {
        db.prepare(
          `UPDATE peserta SET asi_bulan_${umurBulan} = ? WHERE id = ?`,
        ).run(asi_bulan_ini, peserta_id);
      }
    }
  }

  return NextResponse.json(newPendataan, { status: 201 });
};
