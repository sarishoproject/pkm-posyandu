# pkm-posyandu — Sistem Manajemen Posyandu (Vite + React + Hono + Bun)

> Framework fullstack berperforma tinggi yang dirancang untuk perangkat
> berdaya rendah (Raspberry Pi / Orange pi, RAM ~1.5 GB). Satu codebase,
> satu binary, frontend + backend + database lokal menyatu dalam satu proses.
> Aplikasi ini dikhususkan untuk digitalisasi pengelolaan data Posyandu.

---

## Daftar Isi

1. [Fitur Utama Aplikasi](#fitur-utama-aplikasi)
2. [Tech Stack](#tech-stack)
3. [Prasyarat](#prasyarat)
4. [Memulai Proyek](#memulai-proyek)
5. [Panduan Perintah (Scripts package.json)](#panduan-perintah-scripts-packagejson)
6. [Alur Aplikasi & Modul Frontend](#alur-aplikasi--modul-frontend)
7. [Dokumentasi API Backend](#dokumentasi-api-backend)
8. [Database SQLite & Manajemen Schema](#database-sqlite--manajemen-schema)
9. [Panduan CRUD Lengkap (Frontend / Backend / Database)](#panduan-crud-lengkap-frontend--backend--database)
10. [Migrasi Database](#migrasi-database)
11. [File Auto-Generated & File yang Dilarang Diubah](#file-auto-generated--file-yang-dilarang-diubah)
12. [Kompilasi ke Binary Tunggal](#kompilasi-ke-binary-tunggal)
13. [Deployment & GitHub Releases](#deployment--github-releases)
14. [Konvensi Struktur Direktori](#konvensi-struktur-direktori)
15. [Error Handling](#error-handling)
16. [Panduan Kontribusi](#panduan-kontribusi)
17. [FAQ & Tips](#faq--tips)

---

## Fitur Utama Aplikasi

- **Dashboard Statistik**: Visualisasi tren pemeriksaan bulanan, rata-rata pertumbuhan (BB/TB), dan sebaran status pemeriksaan anak per bulan dengan grafik SVG interaktif.
- **Manajemen Anggota (Peserta)**: CRUD data anak balita termasuk NIK, tanggal lahir, jenis kelamin, dan ASI Eksklusif (0–6 bulan). Otomatis generate **QR Code Unik** (8 karakter) per anak saat pendaftaran.
- **Input Pengukuran (Pendataan)**: Form input Berat Badan, Tinggi Badan, Lingkar Kepala, LILA, Pitting Edema, Cara Ukur, dan status ASI Eksklusif.
- **Integrasi Sensor IoT**: Tombol "Ukur Otomatis" yang mem-fetch data timbangan & pengukur tinggi secara real-time dari API Sensor (`mock.fadlanabduh.my.id`).
- **Kartu QR Anggota**: Halaman khusus untuk menampilkan dan mendownload QR Code identitas anak. Juga tersedia halaman "Tampilkan Semua QR" untuk cetak massal (PDF).
- **Ekspor Excel**: Generate laporan rekap pengukuran seluruh anggota langsung ke format `.xlsx` menggunakan `exceljs`, lengkap dengan styling header dan frozen pane.
- **Scanner QR Global**: Bottom navbar dengan tombol scan yang memanfaatkan `html5-qrcode` untuk kamera perangkat, langsung mengarahkan ke form input pengukuran.
- **Single Binary Deployment**: Bisa dikompilasi menjadi 1 file executable untuk berbagai platform (Linux ARM/x64, macOS ARM/x64, Windows x64) dengan auto-setup systemd untuk Raspberry Pi.

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
| **QR Code** | `qrcode.react` (generate) + `html5-qrcode` (scan) |
| **Excel Export** | `exceljs` |
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

> Pastikan Bun versi `>= 1.3.x` untuk dukungan penuh fitur compile & `bun:sqlite`.

---

## Memulai Proyek

```bash
git clone https://github.com/sarishoproject/pkm-posyandu.git pkm-posyandu
cd pkm-posyandu
bun install
bun dev
```

Server dev berjalan di `http://localhost:5173`.

- **Frontend** diakses langsung di browser.
- **Backend** API tersedia di `/api/*` pada port yang sama (hot-reload aktif untuk keduanya).
- **Database** dev otomatis dibuat di `./data/dev.db`.

---

## Panduan Perintah (Scripts package.json)

Berikut adalah penjelasan detail untuk setiap script yang tersedia di `package.json`:

### 1. `bun dev` — Menjalankan Development Server

```bash
bun dev
```

Perintah ini menjalankan `bun --bun vite` yang memulai Vite dev server. Pada mode ini:

- Frontend React berjalan dengan **hot module replacement (HMR)**.
- Backend Hono dijalankan via `@hono/vite-dev-server` sehingga setiap perubahan file API langsung ter-load tanpa restart.
- Database yang digunakan adalah `./data/dev.db` (terpisah dari produksi).
- Akses aplikasi di `http://localhost:5173`.

Gunakan mode ini saat **mengembangkan fitur atau memperbaiki bug**.

---

### 2. `bun run build` — Build Frontend untuk Produksi

```bash
bun run build
```

Perintah ini menjalankan dua langkah berurutan:

1. `tsc -b` — Type-check seluruh project TypeScript (memastikan tidak ada error tipe).
2. `bun --bun vite build` — Bundle frontend ke `dist/client/`.

> Catatan: Perintah ini hanya mem-build **frontend saja**. Untuk mendapatkan binary lengkap (frontend + backend), gunakan `bun run compile`.

---

### 3. `bun run preview` — Preview Hasil Build Frontend

```bash
bun run preview
```

Menjalankan Vite preview server untuk menguji hasil `bun run build` secara lokal sebelum deploy. Hanya melayani file statis dari `dist/client/` (tanpa backend API).

---

### 4. `bun run lint` — Cek & Format Kode

```bash
bun run lint
```

Perintah ini menjalankan dua langkah Biome:

1. `biome check --write` — Memeriksa seluruh file dan **otomatis memperbaiki** masalah yang bisa diperbaiki (formatting, import sorting, dll).
2. `biome ci` — Menjalankan cek final bergaya CI (continuous integration) untuk memastikan tidak ada error yang tersisa.

> **Penting:** Selalu jalankan `bun run lint` sebelum commit. Script `verify` juga memanggil perintah ini.

---

### 5. `bun run compile` — Kompilasi ke Binary Tunggal

```bash
# Default: Memilih target secara interaktif
bun run compile

# Target spesifik
bun run compile --target=bun-linux-x64
bun run compile --target=bun-darwin-arm64
bun run compile --target=bun-darwin-x64
bun run compile --target=bun-windows-x64
```

Perintah ini menjalankan `scripts/compile.ts` yang melakukan 5 langkah:

1. **Build Frontend** — `vite build` ke `dist/client/`.
2. **Build Server (SSR)** — `vite build --ssr src/server.ts` ke `dist/server/`.
3. **Generate Embedded Assets** — Semua file frontend (HTML, CSS, JS, Font, SVG, gambar) di-import dan di-embed ke `dist/_embeds.ts` sebagai string (text) atau raw bytes (binary).
4. **Generate Entry Point** — Membuat `dist/entry.ts` yang me-load `_embeds.ts` terlebih dahulu, lalu server.
5. **Compile Binary** — `bun build --compile` dengan flag `--minify --bytecode --sourcemap=none` untuk menghasilkan binary tunggal.

#### Penanganan Network Timeout (Cross-Compile)
Jika Anda melakukan **cross-compile** (misal dari Windows ke Linux), Bun akan mendownload binary target dari GitHub. Jika koneksi lambat, script ini otomatis melakukan **retry hingga 3 kali** dan meningkatkan timeout download menjadi 10 menit (`BUN_DOWNLOAD_TIMEOUT=600`).

#### Output
Nama binary akan menyertakan suffix target agar tidak saling menimpa:
```
build/
├── pkm-posyandu-bun-windows-x64.exe
├── pkm-posyandu-bun-linux-x64
├── pkm-posyandu-bun-linux-arm64
├── pkm-posyandu-bun-darwin-x64
└── pkm-posyandu-bun-darwin-arm64
```

---

### 6. `bun run start` — Menjalankan Binary (Cross-Platform)

```bash
bun run start
```

Script `start` (di `scripts/start.ts`) akan mendeteksi OS Anda saat ini dan mencari file binary yang sesuai di dalam folder `build/`. Jika ditemukan, binary tersebut akan dijalankan secara langsung. Jika tidak ada, akan muncul pesan error.

---

### 7. `bun run commit` — AI Auto Commit & Changelog Generator

```bash
bun run commit
```

Perintah ini menjalankan `scripts/commit.ts`, sebuah script otomatisasi commit berbasis **Google Gemini AI**. Berikut alurnya:

1. **Stage semua perubahan** (`git add .`) lalu ambil `git diff`.
2. **Konsultasi ke Gemini AI** dengan model `gemini-3.1-flash-lite` untuk menganalisis diff.
3. AI menghasilkan proposal berupa:
   - `commitMessage` — Pesan commit mengikuti Conventional Commits (`feat:`, `fix:`, `refactor:`, dll).
   - `changelog` — Daftar perubahan dengan emoji per baris.
   - `bump` — Jenis version bump (`major`, `minor`, `patch`, atau `none`).
   - `checkResult` — Security check untuk mendeteksi kebocoran secret (API key, password, dll).
4. **Security Check** — Jika ada potensi kebocoran secret, user akan diminta konfirmasi sebelum lanjut.
5. **Konfirmasi User** — User menyetujui atau membatalkan proposal.
6. **Update Version** — Jika bump ≠ `none`, versi di `package.json` diupdate (semver).
7. **Update Changelog** — Entri baru ditambahkan ke `CHANGELOG.md`.
8. **Commit & Tag** — Git commit dengan pesan AI, lalu buat tag `v{version}`.
9. **Auto-Push** — Script akan menanyakan apakah ingin langsung push ke remote (beserta tag versinya).

#### Setup Pertama Kali `bun run commit`

Saat pertama kali menjalankan, script akan meminta **Google Gemini API Key**. Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/apikey). API Key disimpan di file `.commit-auth.json` (sudah di-gitignore).

---

### 8. `bun run verify` — Pre-Commit Verification

```bash
bun run verify
```

Script ini melakukan pengecekan otomatis sebelum commit:
- Menjalankan **Biome CI** (via `bun lint`) dengan animasi spinner.
- Menjalankan **TypeScript Type Check** (`tsc -b`) dengan animasi spinner.
- Memeriksa apakah ada file konfigurasi fix (protected files) yang diubah tanpa konfirmasi grup.
- Memeriksa apakah ada file auto-generated (`routeTree.gen.ts` atau `src/components/ui/*`) yang diedit manual.
- Memeriksa apakah ada file `.sql` baru di `src/db/schema/` yang belum terdaftar di `schemaOrder`.

Script ini otomatis dipanggil oleh `bun run commit`.

---

### 9. `bun run digest` — Generate Project Digest

```bash
bun run digest
```

Menjalankan `bunx @rilaptra/digester@latest`, sebuah tool eksternal yang membaca seluruh struktur repository (folder, file, dan konten kode) lalu menggabungkannya menjadi satu file teks terstruktur. Berguna untuk memberikan konteks ke AI.

---

## Alur Aplikasi & Modul Frontend

Aplikasi ini menggunakan arsitektur mirip Next.js/App Router namun dengan Hono di sisi backend. Berikut adalah alur setiap halaman frontend:

### 1. Halaman Dashboard (`/`)
**File:** `src/app/index.tsx`
Menampilkan ringkasan data posyandu:
- Kartu hero dengan total peserta & total pemeriksaan.
- Filter bulan (bisa navigasi ke bulan sebelumnya/selanjutnya).
- Toggle metrik (Berat/Tinggi) untuk grafik sebaran pemeriksaan bulan ini.
- Progress bar "sudah periksa vs belum periksa" bulan ini.
- Dua kartu mini ala TradingView untuk rata-rata berat & tinggi bulanan.
- Grafik bar chart tren pemeriksaan bulanan.

### 2. Halaman Anggota (`/anggota`)
**File:** `src/app/anggota/index.tsx`
List anggota posyandu dengan filter tab: "Semua", "Sudah", "Belum" (berdasarkan pemeriksaan bulan ini). Card per anak dengan inisial nama, gender icon, dan umur otomatis.

### 3. Halaman Pencarian (`/cari`)
**File:** `src/app/cari/index.tsx`
Pencarian *fuzzy match* berdasarkan nama atau NIK. Menyimpan 5 riwayat pencarian terakhir di `localStorage`.

### 4. Halaman Detail Anggota (`/anggota/$id`)
**File:** `src/app/anggota/$id/index.tsx`
Menampilkan grafik pertumbuhan BB & TB interaktif (SVG), kartu data terbaru, list riwayat pengukuran dengan badge, dan modal popup detail pengukuran.

### 5. Halaman Input Pengukuran (`/anggota/$id/pengukuran/tambah`)
**File:** `src/app/anggota/$id/pengukuran/tambah.tsx`
Form input data pengukuran posyandu. Terdapat tombol "Ukur BB & TB (Sensor)" yang fetch paralel dari API sensor.

### 6. Halaman Edit Pengukuran (`/anggota/$id/pengukuran/$pengukuranId`)
**File:** `src/app/anggota/$id/pengukuran/$pengukuranId.tsx`

### 7. Halaman Kartu QR (`/anggota/barcode/$id`)
**File:** `src/app/anggota/barcode/$id.tsx`
Menampilkan QR Code (level H) dan tombol download PNG.

### 8. Halaman Pengaturan (`/pengaturan`)
**File:** `src/app/pengaturan/index.tsx`
Halaman admin dengan Aksi Cepat (Ekspor Excel, Bersihkan Riwayat), Manajemen Anggota (Tambah, Tampilkan Semua QR, Hapus), dan Bantuan.

### 9. Root Layout (`src/app/__root.tsx`)
Layout pembungkus: bottom navbar, global QR scanner menggunakan `html5-qrcode`, dan Custom Alert/Confirm Dialog.

---

## Dokumentasi API Backend

API dibangun dengan Hono dan **teregistrasi otomatis** oleh `src/app/api/index.ts` menggunakan `import.meta.glob("./**/route.ts", { eager: true })`.

### Daftar Endpoint API

#### Stats API
- `GET /api/stats`: Mengambil statistik dashboard. Mendukung query parameter `month` (format `YYYY-MM`).

#### Peserta API
- `GET /api/peserta`: Mengambil semua peserta dengan flag `sudah_diperiksa`.
- `POST /api/peserta`: Menambah peserta baru. QR Code otomatis di-generate.
- `GET /api/peserta/:id`: Mengambil detail peserta beserta riwayat pengukuran. Parameter `:id` bisa berupa ID angka atau QR Code string.
- `PUT /api/peserta/:id`: Update data peserta.
- `DELETE /api/peserta/:id`: Hapus peserta.

#### Pendataan API
- `POST /api/pendataan`: Input hasil pengukuran baru.
- `GET /api/pendataan/:id`: Mengambil satu record pendataan.
- `PUT /api/pendataan/:id`: Update record pendataan.
- `DELETE /api/pendataan/:id`: Hapus record pendataan.

#### Export API
- `GET /api/export`: Menghasilkan file Excel `.xlsx` berisi rekap semua data pengukuran.

---

## Database SQLite & Manajemen Schema

Database diakses melalui singleton di `src/db/connection.ts`:

```ts
import db from "@/db/connection";
```

### Lokasi File Database

| Mode | Lokasi |
|---|---|
| **Dev** (`NODE_ENV !== "production"`) | `./data/dev.db` |
| **Produksi** | `process.env.DB_PATH` atau `data/data.db` |

### Struktur Tabel

#### Tabel `peserta` (Induk)
```sql
CREATE TABLE IF NOT EXISTS peserta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nik TEXT UNIQUE NOT NULL,
  nama_anak TEXT NOT NULL,
  nama_ibu TEXT,
  jenis_kelamin TEXT,
  tanggal_lahir TEXT,
  status TEXT DEFAULT 'aktif',
  asi_bulan_0 TEXT DEFAULT 'tidak',
  -- ... asi_bulan_1 sampai asi_bulan_6
  qr_code TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabel `pendataan` (Anak, FK ke peserta)
```sql
CREATE TABLE IF NOT EXISTS pendataan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  peserta_id INTEGER NOT NULL,
  tanggal_ukur DATE NOT NULL,
  berat REAL,
  tinggi REAL,
  lila REAL,
  lingkar_kepala REAL,
  pitting_edema TEXT,
  cara_ukur TEXT,
  vita TEXT,
  kelas_ibu_balita TEXT,
  mbg TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (peserta_id) REFERENCES peserta(id) ON DELETE CASCADE
);
```

Skema dipecah menjadi beberapa file `.sql` di `src/db/schema/` dan di-embed ke dalam binary (via `?raw` import) sehingga tidak butuh file `.sql` eksternal.

---

## Kompilasi ke Binary Tunggal (True Single File)

Proyek dapat dikompilasi menjadi **satu file executable** yang mencakup frontend (ter-embed 100% di dalam binary) + backend + schema database. Hanya file database SQLite (`data.db`) yang berada di luar (karena butuh akses tulis).

### Cara Kompilasi

```bash
# Default: Pilih target secara interaktif
bun run compile

# Target spesifik
bun run compile --target=bun-linux-x64
```

### Menjalankan Binary

Setelah compile, jalankan dengan script `start`:
```bash
bun run start
```
Atau jalankan langsung file binary-nya:
```bash
# Linux/macOS
chmod +x build/pkm-posyandu-bun-linux-x64
./build/pkm-posyandu-bun-linux-x64

# Windows
build\pkm-posyandu-bun-windows-x64.exe
```

---

## Deployment & GitHub Releases

### Auto Setup di Raspberry Pi (Linux ARM64)

1. Copy file `pkm-posyandu-bun-linux-arm64` ke Raspberry Pi.
2. Beri permission eksekusi:
   ```bash
   chmod +x pkm-posyandu-bun-linux-arm64
   ```
3. Jalankan perintah setup (butuh akses root):
   ```bash
   sudo ./pkm-posyandu-bun-linux-arm64 setup
   ```
   Binary akan secara otomatis membuat file service systemd, enable auto-start, dan menjalankan service.

### CI/CD GitHub Actions & Releases

Setiap kali tag `v*` di-push ke GitHub, workflow akan dijalankan. Workflow menggunakan **matrix strategy** yang berarti binary untuk setiap platform di-build di runner native-nya:
- `windows-latest` untuk Windows x64
- `ubuntu-latest` untuk Linux x64 & ARM64

> **Catatan:** Build untuk macOS sengaja tidak disertakan di CI/CD GitHub Actions karena memakan waktu antrian runner yang sangat lama. Jika Anda membutuhkan binary untuk macOS, Anda bisa melakukan compile secara manual di perangkat Mac Anda menggunakan perintah `bun run compile --target=bun-darwin-arm64`.

Setelah build selesai, binary di-zip (Windows) atau di-tar.gz (Unix) dengan permission executable yang sudah diatur. Kemudian, file-file tersebut di-upload ke halaman **GitHub Releases**.

#### Auto-Generate Release Notes dari Changelog
Saat release dipublish, workflow akan mengekstrak entry paling atas dari `CHANGELOG.md` (yang di-generate oleh Gemini AI) dan menyisipkannya sebagai deskripsi di halaman GitHub Release. Jadi, user yang mendownload binary bisa langsung membaca apa saja yang baru di versi tersebut.

---

## File Auto-Generated & File yang Dilarang Diubah

### File Auto-Generated (JANGAN EDIT MANUAL)

| File | Di-generate oleh |
|---|---|
| `src/routeTree.gen.ts` | TanStack Router Vite Plugin |
| `src/components/ui/*` | Shadcn CLI |
| `dist/` | `vite build` |
| `dist/_embeds.ts` & `dist/entry.ts` | `scripts/compile.ts` |
| `build/` | `bun build --compile` |
| `data/*.db` | Runtime aplikasi |
| `CHANGELOG.md` | `scripts/commit.ts` |

### File Konfigurasi Fix (Wajib Konfirmasi Grup)

Mengubah file-file ini tanpa konfirmasi dapat merusak build/CI:
- `package.json`
- `biome.json`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `vite.config.ts`
- `components.json`
- `.gitignore`
- `scripts/compile.ts`
- `scripts/commit.ts`
- `src/server.ts`
- `src/db/connection.ts`
- `src/app/api/index.ts`
- `src/lib/classes/server.ts`
- `src/types/raw.d.ts`

> Jika Anda mengubahnya, script `verify` akan memberikan warning.

---

## Error Handling

Proyek ini menerapkan **multi-layer error handling**:
1. **Database** (`src/db/connection.ts`): `process.exit(1)` jika gagal inisialisasi.
2. **API Backend** (`src/app/api/index.ts`): Global error handler via `app.onError()` menangkap exception -> response 500 JSON.
3. **Server** (`src/server.ts`): Fallback `index.html` untuk SPA routing, auto-setup SSL via `mkcert`.
4. **Kompilasi** (`scripts/compile.ts`): Retry logic jika terjadi timeout download dari GitHub.
5. **Frontend**: `try/catch` di setiap `fetch`, dengan UI feedback via `window.showCustomAlert`.

---

## FAQ & Tips

### Q: Kenapa saat compile di local timeout terus?
R: Saat melakukan cross-compile (misal dari Windows ke Linux), Bun mendownload binary target dari GitHub. Koneksi dari Indonesia sering tidak stabil. Script `compile.ts` sudah dilengkapi dengan retry logic (3x) dan extended timeout. Jika masih gagal, disarankan gunakan VPN, download manual, atau build di OS target yang sesuai.

### Q: Bagaimana cara reset database dev?
```bash
rm data/dev.db
bun dev  # Database akan dibuat ulang otomatis
```

### Q: Kenapa QR Code di-scan tidak terbaca?
Pastikan URL yang di-encode menggunakan IP lokal (bukan localhost), aplikasi berjalan di port yang sama, dan HP & server berada di jaringan WiFi yang sama.

### Q: Bagaimana cara menambahkan jenis pengukuran baru?
1. Buat migration script (`ALTER TABLE ... ADD COLUMN`).
2. Update file `.sql` di `src/db/schema/`.
3. Update types di `src/types/backend/`.
4. Update API route handler.
5. Update form frontend.
6. Update export Excel di `src/app/api/export/route.ts`.

### Q: Apakah aman menghapus folder `dist/` atau `build/`?
Ya, aman. Folder tersebut berisi hasil build yang bisa di-regenerate kapan saja dengan `bun run build` atau `bun run compile`.