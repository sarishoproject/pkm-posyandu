import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler } from "@/types";

// DELETE /api/pendataan/:id
export const DELETE: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;
  const deleted = db
    .prepare("DELETE FROM pendataan WHERE id = ? RETURNING *")
    .get(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Data pendataan tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ message: "Data pendataan berhasil dihapus." });
};

// PUT /api/pendataan/:id
export const PUT: NextRouteHandler<{ id: string }> = async (req) => {
  try {
    const { id } = req.params;
    const body = await req.json();
    const { berat, tinggi, lingkar_kepala, lila, cara_ukur, pitting_edema } =
      body;

    const updated = db
      .prepare(`
        UPDATE pendataan 
        SET berat = ?, tinggi = ?, lingkar_kepala = ?, lila = ?, cara_ukur = ?, pitting_edema = ?
        WHERE id = ? 
        RETURNING *
      `)
      .get(
        berat ? Number(berat) : null,
        tinggi ? Number(tinggi) : null,
        lingkar_kepala ? Number(lingkar_kepala) : null,
        lila ? Number(lila) : null,
        cara_ukur || "Berdiri",
        pitting_edema,
        id,
      );

    if (!updated) {
      return NextResponse.json(
        { error: "Data pendataan tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Data berhasil diupdate.",
      data: updated,
    });
  } catch (error) {
    console.error("Error PUT pendataan:", error);
    return NextResponse.json(
      {
        error:
          (error as Error).message || "Gagal memperbarui data di database.",
      },
      { status: 500 },
    );
  }
};

// GET /api/pendataan/:id
export const GET: NextRouteHandler<{ id: string }> = async (req) => {
  try {
    const { id } = req.params;
    const data = db.prepare("SELECT * FROM pendataan WHERE id = ?").get(id);

    if (!data) {
      return NextResponse.json(
        { error: "Data pendataan tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error GET pendataan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dari server." },
      { status: 500 },
    );
  }
};
