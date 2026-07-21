import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler } from "@/types";

// DELETE /api/pendataan/:id — Hapus riwayat pendataan tertentu (jika salah input)
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
