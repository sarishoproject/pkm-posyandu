import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  created_at: string;
  email: string;
  id: number;
  name: string;
}

// ─── Data Fetchers ────────────────────────────────────────────────────────────

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Gagal memuat data pengguna.");
  return res.json();
};

const createUser = async (data: {
  name: string;
  email: string;
}): Promise<User> => {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal membuat pengguna.");
  }
  return res.json();
};

// ─── Page Component ───────────────────────────────────────────────────────────

function UsersPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Query — ambil semua users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Mutation — tambah user baru
  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setName("");
      setEmail("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, email });
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Manajemen Pengguna</h1>

      {/* Form Tambah User */}
      <form
        className="flex flex-col gap-3 mb-8 p-4 border rounded-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold">Tambah Pengguna Baru</h2>
        <input
          className="border rounded p-2"
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama"
          required
          type="text"
          value={name}
        />
        <input
          className="border rounded p-2"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          type="email"
          value={email}
        />
        <button
          className="bg-primary text-white rounded p-2 hover:opacity-80 disabled:opacity-50"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? "Menyimpan..." : "Tambah"}
        </button>
        {mutation.isError && (
          <p className="text-red-500 text-sm">{mutation.error.message}</p>
        )}
      </form>

      {/* Daftar User */}
      {isLoading && <p className="text-secondary">Memuat data...</p>}
      {error && <p className="text-red-500">{(error as Error).message}</p>}
      {users && (
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <li
              className="p-3 border rounded-lg flex justify-between"
              key={user.id}
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-secondary">{user.email}</p>
              </div>
              <span className="text-xs text-secondary self-center">
                {new Date(user.created_at).toLocaleDateString("id-ID")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Route Definition ─────────────────────────────────────────────────────────

export const Route = createFileRoute("/users/")({
  component: UsersPage,
});
