import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler, User } from "@/types";

// GET /api/users — Ambil semua pengguna
export const GET: NextRouteHandler<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  User[]
> = async () => {
  const users = db.query("SELECT * FROM users ORDER BY created_at DESC").all();
  return NextResponse.json(users as User[]);
};

// POST /api/users — Tambah pengguna baru
export const POST: NextRouteHandler<
  Record<string, never>,
  Record<string, never>,
  { name: string; email: string }
> = async (req) => {
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Field 'name' dan 'email' wajib diisi." },
      { status: 400 },
    );
  }

  const stmt = db.prepare(
    "INSERT INTO users (name, email) VALUES (?, ?) RETURNING *",
  );
  const user = stmt.get(name, email) as User;

  return NextResponse.json(user, { status: 201 });
};
