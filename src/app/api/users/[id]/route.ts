import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler } from "@/types";

// GET /api/users/:id — Ambil satu pengguna berdasarkan ID
export const GET: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;
  const user = db.query("SELECT * FROM users WHERE id = ?").get(id);

  if (!user) {
    return NextResponse.json(
      { error: "Pengguna tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json(user);
};

// DELETE /api/users/:id — Hapus pengguna berdasarkan ID
export const DELETE: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;
  const deleted = db
    .query("DELETE FROM users WHERE id = ? RETURNING *")
    .get(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Pengguna tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    message: "Pengguna berhasil dihapus.",
    user: deleted,
  });
};
