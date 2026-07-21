# pkm-posyandu — Fullstack Framework (Vite + React + Hono + Bun)

> Framework fullstack berperforma tinggi yang dirancang untuk perangkat
> berdaya rendah (Raspberry Pi / Orange Pi, RAM ~1.5 GB). Satu codebase,
> satu binary, frontend + backend + database lokal menyatu dalam satu proses.

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Prasyarat](#prasyarat)
3. [Memulai Proyek](#memulai-proyek)
4. [Arsitektur Proyek](#arsitektur-proyek)
5. [Konvensi Struktur Direktori](#konvensi-struktur-direktori)
6. [Frontend — Routing & State](#frontend--routing--state)
7. [Backend — API & Route Handler](#backend--api--route-handler)
8. [Database SQLite](#database-sqlite)
9. [Error Handling](#error-handling)
10. [Komponen UI (Shadcn)](#komponen-ui-shadcn)
11. [Kompilasi ke Binary Tunggal](#kompilasi-ke-binary-tunggal)
12. [Deployment ke Raspberry Pi](#deployment-ke-raspberry-pi)
13. [Panduan Kontribusi](#panduan-kontribusi)

---

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| **Runtime & Package Manager** | [Bun](https://bun.sh) |
| **Frontend Build** | [Vite](https://vitejs.dev) + `@vitejs/plugin-react` |
| **Frontend Routing** | [TanStack Router](https://tanstack.com/router) (file-based) |
| **Frontend State** | [TanStack Query](https://tanstack.com/query) |
| **Backend Framework** | [Hono](https://hono.dev) (via `@hono/vite-dev-server` saat dev) |
| **Database** | SQLite via `bun:sqlite` (native, tanpa ORM) |
| **Styling** | Tailwind CSS v4 + [Shadcn UI](https://ui.shadcn.com) |
| **Code Quality** | [Biome](https://biomejs.dev) (linter + formatter) |
| **TypeScript** | Strict mode |

---

## Prasyarat

```bash
# Linux / macOS
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verifikasi
bun --version
```

---

## Memulai Proyek

```bash
git clone <url-repo> pkm-posyandu
cd pkm-posyandu
bun install
bun dev
```

Server dev berjalan di `http://localhost:5173`.

- **Frontend** diakses langsung di browser.
- **Backend** API tersedia di `/api/*` pada port yang sama (hot-reload aktif untuk keduanya).

---

## Arsitektur Proyek

```
pkm-posyandu/
├── src/
│   ├── app/
│   │   ├── __root.tsx              # Root layout (wrapper semua halaman)
│   │   ├── index.tsx               # Halaman "/"
│   │   ├── users/                  # Route frontend "/users"
│   │   │   ├── index.tsx
│   │   │   └── $userId/            # Route dinamis frontend "/users/$userId"
│   │   │       └── index.tsx
│   │   └── api/                    # API Backend (Hono)
│   │       ├── index.ts            # Entry Hono + auto-register routes + global error handler
│   │       ├── types.ts            # Re-export dari lib/classes/server.ts
│   │       └── users/
│   │           ├── route.ts        # GET/POST /api/users
│   │           └── [id]/route.ts   # GET/DELETE /api/users/:id
│   ├── components/ui/              # Komponen Shadcn (JANGAN edit manual)
│   ├── db/
│   │   ├── connection.ts           # Singleton SQLite + validasi schema
│   │   └── schema/
│   │       ├── index.ts            # schemaOrder + validateSchemaRegistry()
│   │       ├── users.sql
│   │       └── berat_badan.sql
│   ├── lib/
│   │   ├── classes/
│   │   │   ├── server.ts           # NextRequest, NextResponse, NextRouteHandler
│   │   │   └── client.ts           # Placeholder untuk client-side classes
│   │   └── utils/index.ts          # cn() helper
│   ├── types/                      # Type definitions (frontend/backend)
│   ├── server.ts                   # Entry point produksi (serve frontend + API + setup arg)
│   ├── main.tsx                    # Entry point React (mount DOM)
│   ├── routeTree.gen.ts            # Auto-generated TanStack Router (JANGAN edit)
│   └── index.css                   # Tailwind + tema kustom
├── scripts/compile.ts              # Script kompilasi binary (True Single File)
├── vite.config.ts
├── components.json
├── biome.json
└── package.json
```

---

## Konvensi Struktur Direktori

Proyek menerapkan **aturan mirroring**: struktur folder setiap lapisan
mencerminkan struktur route-nya.

### Frontend (`src/app/`)

Setiap halaman adalah file `index.tsx` di dalam folder sesuai path URL-nya.
Route parameter dinamis ditulis sebagai `$param` di nama folder
(konvensi TanStack Router).

| URL | File |
|---|---|
| `/` | `src/app/index.tsx` |
| `/users` | `src/app/users/index.tsx` |
| `/users/:userId` | `src/app/users/$userId/index.tsx` |
| `/dashboard/settings` | `src/app/dashboard/settings/index.tsx` |

### API Backend (`src/app/api/`)

Setiap endpoint adalah file `route.ts`. Route parameter dinamis ditulis
sebagai `[param]` di nama folder (konvensi filesystem-style, akan
dikonversi otomatis menjadi `:param`).

| Endpoint | File |
|---|---|
| `GET/POST /api/users` | `src/app/api/users/route.ts` |
| `GET/DELETE /api/users/:id` | `src/app/api/users/[id]/route.ts` |
| `GET /api/posts/:postId/comments` | `src/app/api/posts/[postId]/comments/route.ts` |
| `GET /api/files/*` | `src/app/api/[...slug]/route.ts` |

> **Catatan:** File `index.ts`, `types.ts`, dan `route.ts` di dalam
> `src/app/api/` otomatis diabaikan oleh TanStack Router melalui
> `routeFileIgnorePattern` di `vite.config.ts`.

### Komponen (`src/components/`)

Komponen spesifik halaman diletakkan di subfolder yang mencerminkan
route pemakaiannya:

```
Route:     src/app/dashboard/settings/index.tsx
Komponen:  src/components/dashboard/settings/SettingsCard.tsx
```

**Jangan** menaruh komponen khusus halaman langsung di root `src/components/`.

### Komponen Shadcn (`src/components/ui/`)

**Jangan pernah edit manual.** Selalu gunakan CLI:

```bash
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add card input label
```

---

## Frontend — Routing & State

### Membuat Halaman Statis

**File:** `src/app/tentang/index.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tentang")({
  component: () => (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Tentang Kami</h1>
    </div>
  ),
});
```

### Membuat Halaman dengan Route Parameter

**File:** `src/app/users/$userId/index.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$userId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  return <div>Hello {userId}</div>;
}
```

### Root Layout (`src/app/__root.tsx`)

Layout pembungkus semua halaman. Cocok untuk navbar, sidebar,
atau provider global.

```tsx
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});
```

### Fetching Data dengan TanStack Query

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchUsers = async () => {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Gagal memuat data.");
  return res.json();
};

function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isLoading) return <p>Memuat...</p>;
  if (error) return <p className="text-red-500">{(error as Error).message}</p>;
  return <ul>{data?.map((u: any) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## Backend — API & Route Handler

API dibangun dengan Hono dan **teregistrasi otomatis** oleh
`src/app/api/index.ts` menggunakan `import.meta.glob`. Anda cukup
membuat file `route.ts` di lokasi yang tepat.

### Class Inti

Class utama backend didefinisikan di `src/lib/classes/server.ts`:

- **`NextRequest<TParams, TQuery, TBody>`** — Wrapper type-safe untuk
  request Hono. Menyediakan akses `params`, `query`, dan `json()`
  dengan dukungan generics.
- **`NextResponse<T>`** — Wrapper type-safe untuk response HTTP.
  Mengikuti pola `NextResponse.json()` dari Next.js.
- **`NextRouteHandler<TParams, TQuery, TBody, TRes>`** — Tipe signature
  untuk handler route API.

File `src/app/api/types.ts` hanya melakukan re-export agar import path
lebih pendek dari dalam folder `app/api/`.

### Membuat Endpoint

**File:** `src/app/api/users/route.ts`

```ts
import db from "@/db/connection";
import type { NextRouteHandler } from "@/app/api/types";
import { NextResponse } from "@/app/api/types";

// GET /api/users
export const GET: NextRouteHandler = async () => {
  const users = db.query("SELECT * FROM users ORDER BY created_at DESC").all();
  return NextResponse.json(users as any[]);
};

// POST /api/users
export const POST: NextRouteHandler<{}, {}, { name: string; email: string }> = async (req) => {
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Field 'name' dan 'email' wajib diisi." },
      { status: 400 },
    );
  }

  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?) RETURNING *");
  const user = stmt.get(name, email);

  return NextResponse.json(user, { status: 201 });
};
```

### Endpoint dengan Parameter

**File:** `src/app/api/users/[id]/route.ts`

```ts
export const GET: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;
  const user = db.query("SELECT * FROM users WHERE id = ?").get(id);

  if (!user) {
    return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json(user);
};
```

### Membaca Query String

```ts
export const GET: NextRouteHandler<{}, { search: string; page: string }> = async (req) => {
  const { search, page } = req.query;
  // ...
};
```

---

## Database SQLite

Database diakses melalui singleton di `src/db/connection.ts`.
Cukup import `db`:

```ts
import db from "@/db/connection";
```

### Lokasi File Database

- **Dev** (`NODE_ENV !== "production"`): `./data/dev.db`
- **Produksi**: nilai dari `process.env.DB_PATH` atau `data.db` (di-sandbox di folder binary berada).

### PRAGMA Otomatis

| Pragma | Nilai | Efek |
|---|---|---|
| `journal_mode` | `WAL` | Tulis lebih cepat, baca paralel tidak terblokir |
| `foreign_keys` | `ON` | Foreign key constraint aktif |
| `busy_timeout` | `5000` | Tunggu 5 detik jika DB terkunci sebelum error |

### Manajemen Schema (Folder `src/db/schema/`)

Skema database dipecah menjadi **multiple file `.sql`** di folder
`src/db/schema/`. Setiap file berisi satu atau lebih `CREATE TABLE`.

**Daftar file schema** dideklarasikan secara eksplisit di
`src/db/schema/index.ts`:

```ts
export const schemaOrder = ["users.sql", "berat_badan.sql"];
```

#### Aturan Urutan

Urutan di `schemaOrder` **harus** memperhatikan dependency foreign key.
Tabel induk (tanpa FK) diletakkan di atas tabel anak.

Contoh:
```sql
-- users.sql (induk, diletakkan lebih dulu)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- berat_badan.sql (anak, merujuk ke users)
CREATE TABLE IF NOT EXISTS berat_badan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  berat REAL NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Validasi Schema (Anti-Lupa Register)

Fungsi `validateSchemaRegistry()` dijalankan otomatis saat aplikasi
start. Fungsi ini akan **memaksa aplikasi keluar (exit code 1)** jika:

- Ada file `.sql` di folder `schema/` yang **belum** didaftarkan di
  `schemaOrder` (mencegah lupa register).
- Ada file di `schemaOrder` yang **tidak ada** di filesystem
  (mencegah typo referensi).

Jika menambahkan tabel baru:

1. Buat file `src/db/schema/nama_tabel.sql`.
2. Daftarkan di array `schemaOrder` di posisi yang benar
   (setelah tabel induknya).

### Pola Query Umum

```ts
// SELECT banyak
const users = db.query("SELECT * FROM users").all();

// SELECT satu
const user = db.query("SELECT * FROM users WHERE id = ?").get(id);

// INSERT dengan RETURNING
const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?) RETURNING *");
const newUser = stmt.get("Budi", "budi@mail.com");

// UPDATE
db.prepare("UPDATE users SET name = ? WHERE id = ?").run("Budi Baru", id);

// DELETE
db.prepare("DELETE FROM users WHERE id = ?").run(id);

// Transaksi
const insertMany = db.transaction((items: { name: string; email: string }[]) => {
  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  for (const item of items) stmt.run(item.name, item.email);
});
insertMany([
  { name: "Andi", email: "andi@mail.com" },
  { name: "Budi", email: "budi@mail.com" },
]);
```

---

## Error Handling

Proyek ini menerapkan **multi-layer error handling** agar robust:

### 1. Database (`src/db/connection.ts`)

- Gagal membuat direktori `data/` → `process.exit(1)`.
- Gagal membuka file SQLite → `process.exit(1)`.
- Gagal mengatur PRAGMA → `console.warn` (non-fatal).
- Validasi schema registry gagal → `process.exit(1)`.
- Gagal mengeksekusi file schema → `process.exit(1)`.

### 2. API Backend (`src/app/api/index.ts`)

- **Global error handler** via `app.onError()` menangkap semua
  exception yang tidak tertangani handler → response 500 JSON.
- **Per-handler wrapper** (`wrapHandler`) membungkus setiap route
  handler dengan try/catch → response 500 JSON dengan pesan error.

### 3. Server (`src/server.ts`)

- Validasi `PORT` (harus angka 1–65535) → exit jika invalid.
- Warning jika `dist/client/` tidak ada (lupa build).
- Fallback `index.html` dibungkus try/catch.

### 4. Kompilasi (`scripts/compile.ts`)

- Setiap langkah (`vite build`, `bun build --compile`) dibungkus
  try/catch terpisah → exit dengan kode non-zero jika gagal.

---

## Komponen UI (Shadcn)

```bash
# Tambah komponen individual
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add card input label

# Mode interaktif
bunx --bun shadcn@latest add
```

Komponen tersimpan di `src/components/ui/`. Contoh penggunaan:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function FormKartu() {
  return (
    <Card className="max-w-sm mx-auto mt-8">
      <CardHeader>
        <CardTitle>Data Pasien</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button>Simpan</Button>
      </CardContent>
    </Card>
  );
}
```

---

## Kompilasi ke Binary Tunggal (True Single File)

Proyek dapat dikompilasi menjadi **satu file executable** yang mencakup
frontend (ter-embed 100% di dalam binary) + backend + schema database.
Hanya file database SQLite (`data.db`) yang berada di luar (karena butuh akses tulis).

```bash
# Default: Linux ARM64 (Raspberry Pi / Orange Pi)
bun run compile

# Target lain
bun run compile --target=bun-linux-x64
bun run compile --target=bun-windows-x64
```

Proses (Otomatis via `scripts/compile.ts`):
1. `vite build` → Frontend di-bundle ke `dist/client/`
2. `vite build --ssr` → Backend di-bundle ke `dist/server/`
3. Generate `_embeds.ts` → Semua aset frontend (HTML, CSS, JS, Font, SVG) di-import dan di-embed sebagai string/bytes.
4. `bun build --compile` → Menggabungkan server + aset terembed + Bun runtime menjadi 1 binary dengan flag `--minify` dan `--bytecode` (untuk startup cepat & ringan).

Output:
```
build/
├── app-bun-linux-arm64
├── app-bun-linux-x64
└── app-bun-windows-x64.exe
```

---

## Deployment ke Raspberry Pi

Aplikasi ini mendukung auto-setup menggunakan systemd. Anda dapat mendistribusikan langsung file binary yang dihasilkan dari proses compile ke Raspberry Pi tanpa perlu menginstal Bun, Node.js, atau dependency lainnya.

### Mode 1: Menggunakan Auto-Setup (Direkomendasikan)

1. Copy file `app-bun-linux-arm64` ke Raspberry Pi (misal via SCP atau flashdrive).
2. Beri permission eksekusi (hanya sekali):
   ```bash
   chmod +x app-bun-linux-arm64
   ```
3. Jalankan perintah setup (butuh akses root):
   ```bash
   sudo ./app-bun-linux-arm64 setup
   ```
   Binary akan secara otomatis:
   - Membuat file service systemd (`/etc/systemd/system/posyandu.service`)
   - Enable service agar jalan otomatis saat Raspberry Pi dinyalakan
   - Start service secara langsung
   - Mengatur pengelolaan log ke syslog (bisa dicek via journalctl)

4. Akses aplikasi di `http://<ip-raspberry-pi>:3000`.

### Mode 2: Setup Manual (Tanpa Argumen Setup)

Jika Anda tidak ingin menggunakan systemd dan lebih memilih menjalankan binary secara manual:

1. Copy file `app-bun-linux-arm64` ke Raspberry Pi.
2. Beri permission eksekusi:
   ```bash
   chmod +x app-bun-linux-arm64
   ```
3. Jalankan langsung binary:
   ```bash
   ./app-bun-linux-arm64
   ```
4. (Opsional) Jika ingin menjalankannya di background tanpa systemd, gunakan `nohup`:
   ```bash
   nohup ./app-bun-linux-arm64 > output.log 2>&1 &
   ```
5. Aplikasi akan berjalan di port 3000. Untuk menghentikan, gunakan `kill <PID>` atau `pkill app-bun-linux-arm64`.

### Variabel Environment Produksi

| Variabel | Default | Deskripsi |
|---|---|---|
| `PORT` | `3000` | Port server HTTP |
| `DB_PATH` | `data.db` | Path file database SQLite |
| `NODE_ENV` | `production` | Otomatis saat compile |

---

## Panduan Kontribusi

### Perintah

```bash
bun dev            # Dev server (frontend + backend, hot-reload)
bun run build      # Build frontend saja
bun run lint       # Biome check
bun run compile    # Kompilasi binary (default: linux-arm64)
```

### Checklist Sebelum Commit

- [ ] `bun run lint` lulus tanpa error
- [ ] File baru `.sql` di `src/db/schema/` sudah didaftarkan di `schemaOrder`
- [ ] Halaman frontend = `index.tsx` di folder route yang sesuai
- [ ] Endpoint API = `route.ts` dengan tipe eksplisit `NextRouteHandler<...>`
- [ ] Tidak mengedit `src/routeTree.gen.ts` manual
- [ ] Tidak mengedit `src/components/ui/` manual (gunakan CLI Shadcn)
- [ ] Komponen diletakkan di subfolder yang mencerminkan route-nya
- [ ] Tidak ada route handler tanpa try/catch effect (sudah di-wrap global)

---

> Dibuat dengan Bun, Hono, React, TanStack, dan SQLite.