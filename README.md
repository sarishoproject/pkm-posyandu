# pkm-posyandu — Sistem Manajemen Posyandu (Vite + React + Hono + Bun)

> Framework fullstack berperforma tinggi yang dirancang untuk perangkat
> berdaya rendah (Raspberry Pi / Orange Pi, RAM ~1.5 GB). Satu codebase,
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
13. [Deployment ke Raspberry Pi](#deployment-ke-raspberry-pi)
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

> **Penting:** Selalu jalankan `bun run lint` sebelum commit. CI/CD pipeline akan menolak PR yang gagal lint.

---

### 5. `bun run compile` — Kompilasi ke Binary Tunggal

```bash
# Default target (Linux ARM64 — untuk Raspberry Pi)
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

#### Target Platform yang Didukung (Sesuai `build.yml`)

| Target | Platform | Output |
|---|---|---|
| `bun-linux-arm64` | Linux ARM 64-bit (Raspberry Pi 4/5, Orange Pi) | `app-bun-linux-arm64` |
| `bun-linux-x64` | Linux x86_64 (Server, PC Linux) | `app-bun-linux-x64` |
| `bun-darwin-arm64` | macOS Apple Silicon (M1/M2/M3) | `app-bun-darwin-arm64` |
| `bun-darwin-x64` | macOS Intel | `app-bun-darwin-x64` |
| `bun-windows-x64` | Windows x86_64 | `app-bun-windows-x64.exe` |

> **Catatan:** Untuk Windows, output otomatis diberi ekstensi `.exe`.

Output binary berada di folder `build/`. Ukuran biasanya berkisar 50–90 MB tergantung target.

---

### 6. `bun run start` — Menjalankan Binary (Windows)

```bash
bun run start
```

Perintah ini khusus untuk **Windows**. Ia menjalankan batch command yang:

1. Mengecek apakah file `build\app-bun-windows-x64.exe` ada.
2. Jika ada → menjalankannya langsung.
3. Jika tidak ada → menampilkan pesan error: *"Error: File EXE belum ada, ngab! Jalanin 'bun run compile' dulu."*

> Untuk Linux/macOS, jalankan binary secara langsung: `./build/app-bun-linux-arm64` atau setara.

---

### 7. `bun run commit` — AI Auto Commit

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
9. **Auto-Push (Bawaan Script)** — Script akan menanyakan apakah ingin langsung push ke remote. Jika dijawab "Ya", script akan otomatis menjalankan `git push origin HEAD` beserta tag versinya. Anda **tidak perlu melakukan `git push` manual secara terpisah**.

#### Setup Pertama Kali `bun run commit`

Saat pertama kali menjalankan, script akan meminta **Google Gemini API Key**:

```
🔑 Google Gemini API Key tidak ditemukan.
👉 Masukkan API Key: ...
```

API Key disimpan di file `.commit-auth.json` (sudah di-gitignore). Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/apikey).

> Alternatif: Set environment variable `GEMINI_API_KEY` untuk skip prompt.

---

### 8. `bun run digest` — Generate Project Digest

```bash
bun run digest
```

Perintah ini menjalankan `bunx @rilaptra/digester@latest`, sebuah tool eksternal yang **membaca seluruh struktur repository** (folder, file, dan konten kode) lalu menggabungkannya menjadi satu file teks terstruktur.

#### Kegunaan:

- **Konteks untuk AI** — File digest bisa di-paste ke AI (Gemini, ChatGPT, Claude) untuk memberikan gambaran lengkap tentang codebase.
- **Code Review** — Memudahkan review menyeluruh tanpa perlu membuka file satu per satu.
- **Dokumentasi** — Sebagai bahan pembuatan dokumentasi atau onboarding anggota tim baru.

> Tidak ada argumen tambahan yang diperlukan. Cukup jalankan `bun digest` dan file digest akan di-generate.

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
- Tombol "Ekspor Data" (hanya untuk admin).

**Data source:** `GET /api/stats?month=YYYY-MM`

---

### 2. Halaman Anggota (`/anggota`)

**File:** `src/app/anggota/index.tsx`

List anggota posyandu dengan:
- Search bar palsu (klik → redirect ke `/cari`).
- Filter tab: "Semua", "Sudah", "Belum" (berdasarkan pemeriksaan bulan ini).
- Card per anak dengan inisial nama, gender icon, dan umur otomatis (Tahun/Bulan).
- Indikator warna: hijau (sudah periksa), oranye (belum).
- Tombol ruler (hanya admin) untuk langsung input pengukuran.

**Data source:** `GET /api/peserta`

---

### 3. Halaman Pencarian (`/cari`)

**File:** `src/app/cari/index.tsx`

Pencarian *fuzzy match* berdasarkan nama atau NIK:
- Auto-focus input saat halaman dibuka.
- Menyimpan 5 riwayat pencarian terakhir di `localStorage` (`recent_searches`).
- Shortcut "Cari yang belum/sudah diukur bulan ini".
- Tombol ruler (admin) untuk langsung input pengukuran dari hasil pencarian.

---

### 4. Halaman Detail Anggota (`/anggota/$id`)

**File:** `src/app/anggota/$id/index.tsx`

Menampilkan:
- Profil anak (inisial, nama, NIK, tanggal lahir, umur, jenis kelamin).
- Grafik pertumbuhan BB & TB interaktif (SVG) — titik bisa diklik untuk detail.
- Kartu data terbaru (BB, TB, lingkar kepala, LILA).
- List riwayat pengukuran dengan badge "Terbaru", "Bulan Ini", "X Bulan Lalu".
- Modal popup detail pengukuran.
- Tombol admin: QR, Edit, Tambah Pengukuran, Hapus Riwayat.

**Data source:** `GET /api/peserta/:id` (mengembalikan peserta + array `riwayat`)

---

### 5. Halaman Tambah Anggota (`/anggota/tambah`)

**File:** `src/app/anggota/tambah/index.tsx`

Form pendaftaran anak baru:
- Nama Anak (text, required)
- NIK (16 digit angka, required)
- Jenis Kelamin (tombol Laki-laki/Perempuan)
- Tanggal Lahir (select Tgl/Bulan + input Tahun, validasi 2000–tahun ini)
- Nama Ibu Kandung (text, opsional)

**Submit ke:** `POST /api/peserta`

---

### 6. Halaman Edit Anggota (`/anggota/$id/edit`)

**File:** `src/app/anggota/$id/edit.tsx`

Sama seperti form tambah, namun data pre-loaded dari `GET /api/peserta/:id`. Tanggal lahir dipecah menjadi Tgl/Bulan/Tahun untuk editing.

**Submit ke:** `PUT /api/peserta/:id`

---

### 7. Halaman Input Pengukuran (`/anggota/$id/pengukuran/tambah`)

**File:** `src/app/anggota/$id/pengukuran/tambah.tsx`

Form input data pengukuran posyandu:
- Profil anak di bagian atas.
- **Sensor Otomatis** — Tombol "Ukur BB & TB (Sensor)" yang fetch paralel dari:
  - `https://mock.fadlanabduh.my.id/api/weight`
  - `https://mock.fadlanabduh.my.id/api/height`
- Input manual: Lingkar Kepala, LILA, Cara Ukur (Berdiri/Terlentang), Pitting Edema (checkbox), ASI Eksklusif (select Ya/Tidak).
- Validasi: tombol Simpan disabled sampai semua field wajib terisi.

**Submit ke:** `POST /api/pendataan`

---

### 8. Halaman Edit Pengukuran (`/anggota/$id/pengukuran/$pengukuranId`)

**File:** `src/app/anggota/$id/pengukuran/$pengukuranId.tsx`

Sama seperti form input, namun data pre-loaded dari `GET /api/pendataan/:id`.

**Submit ke:** `PUT /api/pendataan/:id`

---

### 9. Halaman Kartu QR (`/anggota/barcode/$id`)

**File:** `src/app/anggota/barcode/$id.tsx`

Menampilkan kartu identitas anak dengan QR Code:
- QR Code di-generate menggunakan `QRCodeCanvas` (level H untuk error correction tinggi).
- URL yang di-encode: `http://{host}/anggota/{qr_code}/pengukuran/tambah`.
- Tombol "Download QR Code" — menyimpan sebagai PNG.

---

### 10. Halaman Pengaturan (`/pengaturan`)

**File:** `src/app/pengaturan/index.tsx`

Halaman admin dengan:
- **Login form** — Username: `admin`, Password: `Admin#1234` (disimpan di localStorage, BUKAN autentikasi server-side).
- **Aksi Cepat**: Ekspor Excel, Bersihkan Riwayat Cari.
- **Keanggotaan**: Tambah Anggota, Tampilkan Semua QR (dengan cetak PDF), Hapus Anggota (dengan konfirmasi nama).
- **Bantuan**: Tutorial, Bantuan & Dukungan.
- **Zona Berbahaya**: Logout.

**Tampilan "Semua QR"** — Grid semua QR Code anggota dengan fitur:
- Klik card → modal detail dengan QR besar.
- Tombol "Unduh PNG" per anggota.
- Tombol "Cetak (PDF)" — print whole page ke PDF.

---

### 11. Root Layout (`src/app/__root.tsx`)

Layout pembungkus semua halaman:
- Bottom navbar muncul di: `/`, `/anggota`, `/cari`, `/pengaturan`.
- 5 item: Beranda, Cari, Scan (tombol tengah), Anggota, Pengaturan.
- **Global QR Scanner** — Drawer bottom yang menggunakan `html5-qrcode`:
  - Kamera belakang HP otomatis dipilih (`facingMode: environment`).
  - Toggle mirror untuk tampilan depan/belakang.
  - Hasil scan di-parse untuk ekstrak `qr_code`, lalu redirect ke form input.
- **Custom Alert/Confirm Dialog** — Mengganti `window.alert`/`window.confirm` dengan modal UI yang lebih baik (tersedia global via `window.showCustomAlert` & `window.showCustomConfirm`).

---

## Dokumentasi API Backend

API dibangun dengan Hono dan **teregistrasi otomatis** oleh `src/app/api/index.ts` menggunakan `import.meta.glob("./**/route.ts", { eager: true })`.

### Konvensi File Route

- Setiap endpoint adalah file `route.ts` di dalam folder sesuai path.
- Route parameter dinamis: gunakan folder `[id]` → otomatis menjadi `:id`.
- Wildcard route: gunakan `[...slug]` → otomatis menjadi `*`.
- Handler yang diekspor: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.

### Class Inti (`src/lib/classes/server.ts`)

```ts
NextRequest<TParams, TQuery, TBody>  // Wrapper type-safe untuk request
NextResponse<T>                       // Wrapper type-safe untuk response
NextRouteHandler<TParams, TQuery, TBody, TRes>  // Signature handler
```

---

### Daftar Endpoint API

#### 1. Stats API

##### `GET /api/stats`

Mengambil statistik dashboard. Mendukung query parameter `month` (format `YYYY-MM`).

**Query Parameter:**

| Param | Tipe | Default | Deskripsi |
|---|---|---|---|
| `month` | string (YYYY-MM) | Bulan saat ini | Filter statistik per bulan |

**Response 200:**

```json
{
  "total_peserta": 50,
  "total_pemeriksaan": 230,
  "sudah_periksa_bulan_ini": 12,
  "belum_periksa_bulan_ini": 38,
  "tren_bulanan": [
    { "bulan": "Jan 26", "jumlah": 45 },
    { "bulan": "Feb 26", "jumlah": 52 }
  ],
  "rata_rata_pertumbuhan": [
    { "bulan": "Jan 26", "rata_berat": 9.5, "rata_tinggi": 75.2 },
    { "bulan": "Feb 26", "rata_berat": 9.8, "rata_tinggi": 76.1 }
  ],
  "pemeriksaan_bulan_ini": [
    { "id": 1, "nama_panggilan": "Budi", "berat": 12.5, "tinggi": 85.3 },
    { "id": 2, "nama_panggilan": "Siti", "berat": 11.2, "tinggi": 82.1 }
  ]
}
```

**Response 500:** `{ "error": "Gagal mengambil data statistik." }`

---

#### 2. Peserta API

##### `GET /api/peserta`

Mengambil semua peserta dengan flag `sudah_diperiksa` (berdasarkan bulan ini).

**Response 200:**

```json
[
  {
    "id": 1,
    "nik": "3201234567890001",
    "nama_anak": "Budi Santoso",
    "nama_ibu": "Siti Aminah",
    "jenis_kelamin": "Laki-laki",
    "tanggal_lahir": "2023-05-15",
    "status": "aktif",
    "qr_code": "a1b2c3d4",
    "asi_bulan_0": "tidak",
    "asi_bulan_1": "ya",
    "asi_bulan_2": "ya",
    "asi_bulan_3": "ya",
    "asi_bulan_4": "ya",
    "asi_bulan_5": "ya",
    "asi_bulan_6": "ya",
    "created_at": "2026-01-15T08:00:00Z",
    "sudah_diperiksa": 1
  }
]
```

---

##### `POST /api/peserta`

Menambah peserta baru. QR Code otomatis di-generate (8 karakter UUID).

**Request Body:**

```json
{
  "nik": "3201234567890001",
  "nama_anak": "Budi Santoso",
  "nama_ibu": "Siti Aminah",
  "jenis_kelamin": "Laki-laki",
  "tanggal_lahir": "2023-05-15",
  "status": "aktif"
}
```

**Response 201:** Object peserta yang baru dibuat (sama struktur dengan GET).

**Response 400:** `{ "error": "Field 'nik' dan 'nama_anak' wajib diisi." }`

**Response 409:** `{ "error": "NIK atau QR Code sudah terdaftar." }`

---

##### `GET /api/peserta/:id`

Mengambil detail peserta beserta riwayat pengukuran. Parameter `:id` bisa berupa:
- **ID angka** (mis. `1`) — lookup by `id` kolom.
- **QR Code string** (mis. `a1b2c3d4`) — lookup by `qr_code` kolom (untuk hasil scan QR).

**Response 200:**

```json
{
  "id": 1,
  "nik": "3201234567890001",
  "nama_anak": "Budi Santoso",
  "nama_ibu": "Siti Aminah",
  "jenis_kelamin": "Laki-laki",
  "tanggal_lahir": "2023-05-15",
  "status": "aktif",
  "qr_code": "a1b2c3d4",
  "asi_bulan_0": "tidak",
  "asi_bulan_1": "ya",
  "asi_bulan_2": "ya",
  "asi_bulan_3": "ya",
  "asi_bulan_4": "ya",
  "asi_bulan_5": "ya",
  "asi_bulan_6": "ya",
  "created_at": "2026-01-15T08:00:00Z",
  "riwayat": [
    {
      "id": 1,
      "peserta_id": 1,
      "tanggal_ukur": "2026-07-30",
      "berat": 12.5,
      "tinggi": 85.3,
      "lila": 14.2,
      "lingkar_kepala": 45.1,
      "pitting_edema": "Tidak",
      "cara_ukur": "Berdiri",
      "vita": null,
      "kelas_ibu_balita": null,
      "mbg": null,
      "asi": "Ya",
      "created_at": "2026-07-30T08:00:00Z"
    }
  ]
}
```

**Response 404:** `{ "error": "Peserta tidak ditemukan." }`

---

##### `PUT /api/peserta/:id`

Update data peserta. Hanya field yang dikirim yang akan di-update.

**Request Body (partial):**

```json
{
  "nama_anak": "Budi Santoso Updated",
  "nama_ibu": "Siti Aminah Updated"
}
```

**Response 200:** Object peserta yang sudah di-update.

**Response 404:** `{ "error": "Peserta tidak ditemukan." }`

**Response 400:** `{ "error": "Tidak ada data untuk diupdate." }`

---

##### `DELETE /api/peserta/:id`

Hapus peserta berdasarkan ID. Riwayat pengukuran juga ikut terhapus (FK CASCADE).

**Response 200:** `{ "message": "Peserta berhasil dihapus." }`

**Response 404:** `{ "error": "Peserta tidak ditemukan." }`

---

#### 3. Pendataan API

##### `POST /api/pendataan`

Input hasil pengukuran baru.

**Request Body:**

```json
{
  "peserta_id": 1,
  "tanggal_ukur": "2026-07-30",
  "berat": 12.5,
  "tinggi": 85.3,
  "lila": 14.2,
  "lingkar_kepala": 45.1,
  "pitting_edema": "Tidak",
  "cara_ukur": "Berdiri",
  "vita": null,
  "kelas_ibu_balita": null,
  "mbg": null,
  "asi": "Ya"
}
```

**Response 201:** Object pendataan yang baru dibuat.

**Response 400:** `{ "error": "Field 'peserta_id' dan 'tanggal_ukur' wajib diisi." }`

---

##### `GET /api/pendataan/:id`

Mengambil satu record pendataan berdasarkan ID.

**Response 200:** Object pendataan.

**Response 404:** `{ "error": "Data pendataan tidak ditemukan." }`

---

##### `PUT /api/pendataan/:id`

Update record pendataan.

**Request Body:**

```json
{
  "berat": 13.0,
  "tinggi": 86.0,
  "lingkar_kepala": 45.5,
  "lila": 14.5,
  "cara_ukur": "Berdiri",
  "pitting_edema": "Tidak",
  "asi": "Ya"
}
```

**Response 200:** `{ "message": "Data berhasil diupdate.", "data": { ... } }`

**Response 404:** `{ "error": "Data pendataan tidak ditemukan." }`

---

##### `DELETE /api/pendataan/:id`

Hapus record pendataan.

**Response 200:** `{ "message": "Data pendataan berhasil dihapus." }`

**Response 404:** `{ "error": "Data pendataan tidak ditemukan." }`

---

#### 4. Export API

##### `GET /api/export`

Menghasilkan file Excel `.xlsx` berisi rekap semua data pengukuran (dengan JOIN ke peserta).

**Response 200:** Binary file `laporan_posyandu.xlsx` dengan header:
`No, NIK, Nama Anak, Tanggal Lahir, Tanggal Ukur, Berat Badan, Tinggi Badan, LILA, Lingkar Kepala, Pitting Edema, Cara Ukur, Vita, ASI 0-6 Bln, Kelas Ibu Balita, MBG`.

**Response 500:** `{ "error": "Gagal mengekspor data ke Excel." }`

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

### PRAGMA Otomatis

| Pragma | Nilai | Efek |
|---|---|---|
| `journal_mode` | `WAL` | Tulis lebih cepat, baca paralel tidak terblokir |
| `foreign_keys` | `ON` | Foreign key constraint aktif |
| `busy_timeout` | `5000` | Tunggu 5 detik jika DB terkunci sebelum error |

### Struktur Tabel

#### Tabel `peserta` (Induk)

```sql
CREATE TABLE IF NOT EXISTS peserta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nik TEXT UNIQUE NOT NULL,
  nama_anak TEXT NOT NULL,
  nama_ibu TEXT,
  jenis_kelamin TEXT,              -- 'Laki-laki' atau 'Perempuan'
  tanggal_lahir TEXT,              -- Format: YYYY-MM-DD
  status TEXT DEFAULT 'aktif',     -- 'aktif', 'pindah', 'lolos'
  asi_bulan_0 TEXT DEFAULT 'tidak',-- 'ya' atau 'tidak'
  asi_bulan_1 TEXT DEFAULT 'tidak',
  asi_bulan_2 TEXT DEFAULT 'tidak',
  asi_bulan_3 TEXT DEFAULT 'tidak',
  asi_bulan_4 TEXT DEFAULT 'tidak',
  asi_bulan_5 TEXT DEFAULT 'tidak',
  asi_bulan_6 TEXT DEFAULT 'tidak',
  qr_code TEXT UNIQUE,             -- 8 karakter UUID
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
  lila REAL,                       -- Lingkar Lengan Atas
  lingkar_kepala REAL,
  pitting_edema TEXT,              -- 'Ya' atau 'Tidak'
  cara_ukur TEXT,                  -- 'Berdiri' atau 'Terlentang'
  vita TEXT,                       -- 'Ya' atau 'Tidak'
  kelas_ibu_balita TEXT,
  mbg TEXT,
  asi TEXT,                        -- 'Ya' atau 'Tidak'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (peserta_id) REFERENCES peserta(id) ON DELETE CASCADE
);
```

### Manajemen Schema (Folder `src/db/schema/`)

Skema database dipecah menjadi **multiple file `.sql`** di folder `src/db/schema/`. Setiap file berisi satu `CREATE TABLE IF NOT EXISTS`.

**Daftar file schema** dideklarasikan secara eksplisit di `src/db/schema/index.ts`:

```ts
import pendataanSchema from "./pendataan.sql?raw";
import pesertaSchema from "./peserta.sql?raw";

export const schemaOrder = [
  { name: "peserta.sql", content: pesertaSchema },
  { name: "pendataan.sql", content: pendataanSchema },
];
```

#### Aturan Penting Schema

1. **Urutan di `schemaOrder` harus memperhatikan dependency foreign key.** Tabel induk (tanpa FK) diletakkan di atas tabel anak.
2. **Gunakan `CREATE TABLE IF NOT EXISTS`** agar tidak error jika tabel sudah ada.
3. **Schema di-embed ke dalam binary** (via `?raw` import) sehingga tidak butuh file `.sql` eksternal saat production.
4. **Setiap kali server start**, semua schema di `schemaOrder` dieksekusi ulang untuk memastikan struktur DB selalu sinkron.

---

## Panduan CRUD Lengkap (Frontend / Backend / Database)

### A. Database Layer (Schema)

#### 1. Membuat Tabel Baru (Create)

**Langkah 1:** Buat file SQL baru di `src/db/schema/`, misal `pemeriksaan_kesehatan.sql`:

```sql
CREATE TABLE IF NOT EXISTS pemeriksaan_kesehatan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  peserta_id INTEGER NOT NULL,
  tanggal DATE NOT NULL,
  diagnosa TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (peserta_id) REFERENCES peserta(id) ON DELETE CASCADE
);
```

**Langkah 2:** Daftarkan di `src/db/schema/index.ts`:

```ts
import pendataanSchema from "./pendataan.sql?raw";
import pesertaSchema from "./peserta.sql?raw";
import pemeriksaanSchema from "./pemeriksaan_kesehatan.sql?raw";

export const schemaOrder = [
  { name: "peserta.sql", content: pesertaSchema },
  { name: "pendataan.sql", content: pendataanSchema },
  { name: "pemeriksaan_kesehatan.sql", content: pemeriksaanSchema },
];
```

**Langkah 3:** Restart server — tabel otomatis dibuat.

---

#### 2. Mengubah Struktur Tabel (Update)

SQLite **tidak mendukung** `ALTER TABLE` untuk mengubah tipe kolom atau menghapus kolom. Jika perlu perubahan besar, gunakan **migration script**.

##### Cara 1: Tambah Kolom (Simple Alter)

Buat file migration di root project, misal `migrate-add-column.ts`:

```ts
import db from "./src/db/connection";

try {
  console.log("Menambahkan kolom baru...");
  db.exec(`ALTER TABLE pendataan ADD COLUMN catatan TEXT DEFAULT NULL;`);
  console.log("✅ Migrasi sukses!");
} catch (error) {
  console.error("❌ Gagal migrasi:", error);
}
```

Jalankan sekali: `bun run migrate-add-column.ts`

##### Cara 2: Update File Schema (untuk install baru)

Edit file `.sql` yang sesuai, misal `src/db/schema/pendataan.sql`:

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
  asi TEXT,
  catatan TEXT DEFAULT NULL,  -- ← kolom baru
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (peserta_id) REFERENCES peserta(id) ON DELETE CASCADE
);
```

> `CREATE TABLE IF NOT EXISTS` tidak akan mengubah tabel yang sudah ada. Untuk DB yang sudah ada, jalankan migration script. Untuk install baru, schema akan otomatis membuat struktur terbaru.

---

#### 3. Menghapus Tabel (Delete)

Tambahkan di file schema:

```sql
DROP TABLE IF EXISTS nama_tabel_lama;
```

Atau jalankan via migration script:

```ts
db.exec("DROP TABLE IF EXISTS nama_tabel_lama;");
```

> **Hati-hati:** `DROP TABLE` akan menghapus semua data. Selalu backup database sebelum drop.

---

#### 4. Membaca Struktur Tabel (Read)

```bash
# Via sqlite3 CLI
sqlite3 data/dev.db ".schema"

# Atau via script
bun -e "import db from './src/db/connection'; console.log(db.query('SELECT sql FROM sqlite_master WHERE type=\"table\"').all());"
```

---

### B. Backend Layer (API Routes)

#### 1. Membuat Endpoint Baru (Create)

**Langkah 1:** Buat folder & file `route.ts` sesuai path yang diinginkan.

Contoh: Endpoint `GET /api/pemeriksaan-kesehatan`

**File:** `src/app/api/pemeriksaan-kesehatan/route.ts`

```ts
import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler } from "@/types";

export const GET: NextRouteHandler = async () => {
  try {
    const data = db.query("SELECT * FROM pemeriksaan_kesehatan").all();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data." },
      { status: 500 }
    );
  }
};

export const POST: NextRouteHandler<{}, {}, { peserta_id: number; diagnosa: string }> = async (req) => {
  const body = await req.json();
  const { peserta_id, diagnosa } = body;

  if (!peserta_id) {
    return NextResponse.json(
      { error: "Field 'peserta_id' wajib diisi." },
      { status: 400 }
    );
  }

  const stmt = db.prepare(
    "INSERT INTO pemeriksaan_kesehatan (peserta_id, diagnosa) VALUES (?, ?) RETURNING *"
  );
  const newData = stmt.get(peserta_id, diagnosa || null);

  return NextResponse.json(newData, { status: 201 });
};
```

**Langkah 2:** Restart dev server — endpoint otomatis terdaftar via `import.meta.glob`.

---

#### 2. Membuat Endpoint dengan Parameter Dinamis

**File:** `src/app/api/pemeriksaan-kesehatan/[id]/route.ts`

```ts
import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler } from "@/types";

export const GET: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;
  const data = db.query("SELECT * FROM pemeriksaan_kesehatan WHERE id = ?").get(id);

  if (!data) {
    return NextResponse.json(
      { error: "Data tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
};

export const PUT: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;
  const body = await req.json();
  const { diagnosa } = body;

  const updated = db.prepare(
    "UPDATE pemeriksaan_kesehatan SET diagnosa = ? WHERE id = ? RETURNING *"
  ).get(diagnosa, id);

  if (!updated) {
    return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json(updated);
};

export const DELETE: NextRouteHandler<{ id: string }> = async (req) => {
  const { id } = req.params;
  const deleted = db.prepare("DELETE FROM pemeriksaan_kesehatan WHERE id = ? RETURNING *").get(id);

  if (!deleted) {
    return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ message: "Data berhasil dihapus." });
};
```

---

#### 3. Mengubah Endpoint (Update)

Edit langsung file `route.ts` yang sesuai. Karena menggunakan `import.meta.glob` dengan `eager: true`, perubahan akan otomatis terdeteksi saat dev server restart (hot-reload).

---

#### 4. Menghapus Endpoint (Delete)

Hapus folder yang berisi file `route.ts` tersebut. Endpoint otomatis hilang saat restart.

---

### C. Frontend Layer (Pages & Components)

#### 1. Membuat Halaman Statis (Create)

**File:** `src/app/tentang/index.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tentang")({
  component: TentangPage,
});

function TentangPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold">Tentang Posyandu</h1>
      <p className="mt-4 text-slate-600">Deskripsi tentang aplikasi...</p>
    </div>
  );
}
```

> File `src/routeTree.gen.ts` akan **otomatis ter-generate** ulang oleh Vite plugin saat dev server berjalan.

---

#### 2. Membuat Halaman dengan Route Parameter (Create)

**File:** `src/app/anggota/$id/info.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/anggota/$id/info")({
  component: InfoPage,
});

function InfoPage() {
  const { id } = Route.useParams();
  return <div>Info untuk Anggota ID: {id}</div>;
}
```

---

#### 3. Mengubah Halaman (Update)

Edit langsung file `.tsx` yang sesuai. Vite HMR akan otomatis reload halaman.

---

#### 4. Menghapus Halaman (Delete)

Hapus file `.tsx` atau folder route. `routeTree.gen.ts` akan regenerate otomatis.

---

#### 5. Fetching Data dari Frontend

##### Menggunakan `fetch` langsung (cocok untuk useEffect):

```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("/api/peserta");
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setPesertaList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);
```

##### Menggunakan TanStack Query (rekomendasi untuk data yang sering berubah):

```tsx
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["peserta"],
  queryFn: async () => {
    const res = await fetch("/api/peserta");
    if (!res.ok) throw new Error("Gagal memuat data");
    return res.json();
  },
});
```

---

#### 6. Mengirim Data (POST/PUT/DELETE) dari Frontend

```tsx
// POST
const response = await fetch("/api/pendataan", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

// PUT
const response = await fetch(`/api/pendataan/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

// DELETE
const response = await fetch(`/api/pendataan/${id}`, {
  method: "DELETE",
});
```

---

## Migrasi Database

Proyek ini menyertakan script migration yang bisa dijadikan template:

### `migrate-asi.ts` — Menambah Kolom `asi` ke Tabel `pendataan`

```bash
bun run migrate-asi.ts
```

Menambahkan kolom `asi TEXT DEFAULT 'tidak'` ke tabel `pendataan`.

### `migrate-qrcode.ts` — Update Semua QR Code ke Versi Pendek (8 karakter)

```bash
bun run migrate-qrcode.ts
```

Loop melalui semua peserta, generate UUID baru (8 karakter), dan update `qr_code`. Dijalankan dalam transaction untuk performa.

### Template Migration Script Umum

```ts
import db from "./src/db/connection";

try {
  console.log("Memulai migrasi...");

  // Contoh: Tambah kolom baru
  db.exec(`ALTER TABLE pendataan ADD COLUMN catatan TEXT DEFAULT NULL;`);

  // Contoh: Update data massal
  const updateStmt = db.prepare("UPDATE peserta SET status = ? WHERE status IS NULL");
  updateStmt.run("aktif");

  console.log("✅ Migrasi sukses!");
} catch (error) {
  console.error("❌ Gagal migrasi:", error);
}
```

> **Tips:** Selalu backup database (`cp data/dev.db data/dev.db.backup`) sebelum menjalankan migration yang destruktif.

---

## File Auto-Generated & File yang Dilarang Diubah

### File Auto-Generated (JANGAN EDIT MANUAL)

| File | Di-generate oleh | Kapan |
|---|---|---|
| `src/routeTree.gen.ts` | TanStack Router Vite Plugin | Saat dev server / build |
| `src/components/ui/*` | Shadcn CLI (`bunx shadcn add`) | Saat tambah komponen baru |
| `dist/` | `vite build` | Saat `bun run build` atau `bun run compile` |
| `dist/_embeds.ts` | `scripts/compile.ts` | Saat `bun run compile` |
| `dist/entry.ts` | `scripts/compile.ts` | Saat `bun run compile` |
| `build/` | `bun build --compile` | Saat `bun run compile` |
| `data/*.db` | Runtime aplikasi | Saat server start pertama kali |
| `CHANGELOG.md` | `scripts/commit.ts` | Saat `bun run commit` |
| `.commit-auth.json` | `scripts/commit.ts` | Saat pertama kali setup API Key |
| `node_modules/` | `bun install` | Saat install dependency |
| `bun.lock` | `bun install` | Saat install/update dependency |

### File Konfigurasi yang Tidak Boleh Diubah Tanpa Konfirmasi Grup

Berikut adalah file-file yang **sudah fix** dan tidak boleh diubah sembarangan kecuali sudah dikonfirmasi di grup tim:

| File | Alasan |
|---|---|
| `package.json` (bagian `dependencies` & `scripts`) | Mengubah bisa break CI/CD dan build |
| `biome.json` | Aturan linting harus konsisten di seluruh tim |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | Konfigurasi TypeScript project references |
| `vite.config.ts` | Plugin order & SSR config sensitif |
| `components.json` | Konfigurasi Shadcn UI theme |
| `.gitignore` | Mencegah file sensitif ter-commit |
| `scripts/compile.ts` | Logika embed asset & binary build |
| `scripts/commit.ts` | Integrasi AI & changelog otomatis |
| `src/server.ts` | Entry point produksi, logika systemd, dan asset serving |
| `src/db/connection.ts` | Singleton DB & PRAGMA config |
| `src/app/api/index.ts` | Auto-registration logic & global error handler |
| `src/lib/classes/server.ts` | Core wrapper classes (`NextRequest`, `NextResponse`) |
| `src/types/raw.d.ts` | Type declaration untuk `*.sql?raw` import |

> **Jika ingin mengubah file di atas:** Diskusikan di grup terlebih dahulu, buat PR terpisah, dan pastikan semua anggota setuju.

---

## Kompilasi ke Binary Tunggal (True Single File)

Proyek dapat dikompilasi menjadi **satu file executable** yang mencakup frontend (ter-embed 100% di dalam binary) + backend + schema database. Hanya file database SQLite (`data.db`) yang berada di luar (karena butuh akses tulis).

### Cara Kompilasi

```bash
# Default: Linux ARM64 (Raspberry Pi / Orange Pi)
bun run compile

# Target spesifik
bun run compile --target=bun-linux-x64
bun run compile --target=bun-darwin-arm64
bun run compile --target=bun-darwin-x64
bun run compile --target=bun-windows-x64
```

### Proses (5 Langkah via `scripts/compile.ts`)

1. **Build Frontend** — `vite build` ke `dist/client/`.
2. **Build Server (SSR)** — `vite build --ssr src/server.ts` ke `dist/server/`.
3. **Generate Embedded Assets** — Semua aset frontend dikategorikan:
   - **Text assets** (HTML, CSS, JS, SVG, JSON) → di-import sebagai string.
   - **Binary assets** (Font, gambar, ikon) → di-import sebagai raw bytes.
4. **Generate Entry Point** — `dist/entry.ts` me-load `_embeds.ts` lalu `server.js`.
5. **Compile Binary** — `bun build --compile` dengan flag:
   - `--minify` — Kode di-minify untuk ukuran lebih kecil.
   - `--bytecode` — Pre-compile ke bytecode untuk startup cepat.
   - `--sourcemap=none` — Tidak include sourcemap (hemat ukuran).
   - `--define process.env.NODE_ENV:"production"` — Set env production.

### Output

```
build/
├── app-bun-linux-arm64         # ~50-70 MB
├── app-bun-linux-x64
├── app-bun-darwin-arm64
├── app-bun-darwin-x64
└── app-bun-windows-x64.exe
```

### Menjalankan Binary

```bash
# Linux/macOS
chmod +x app-bun-linux-arm64
./app-bun-linux-arm64

# Dengan config custom
PORT=8080 DB_PATH=/data/posyandu.db ./app-bun-linux-arm64

# Windows
build\app-bun-windows-x64.exe

# Atau via npm script (Windows only)
bun run start
```

---

## Deployment ke Raspberry Pi

Aplikasi ini mendukung auto-setup menggunakan systemd. Anda dapat mendistribusikan langsung file binary ke Raspberry Pi tanpa perlu menginstal Bun, Node.js, atau dependency lainnya.

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
   - Mengatur pengelolaan log ke syslog (bisa dicek via `journalctl`)

4. Akses aplikasi di `http://<ip-raspberry-pi>:3000`.

### Mode 2: Setup Manual (Tanpa Argumen Setup)

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

### Perintah Berguna Setelah Setup

```bash
# Cek status service
sudo systemctl status posyandu

# Lihat log real-time
sudo journalctl -u posyandu -f

# Stop service
sudo systemctl stop posyandu

# Start service
sudo systemctl start posyandu

# Restart service
sudo systemctl restart posyandu

# Disable auto-start saat boot
sudo systemctl disable posyandu
```

### Variabel Environment Produksi

| Variabel | Default | Deskripsi |
|---|---|---|
| `PORT` | `3000` | Port server HTTP |
| `DB_PATH` | `data/data.db` | Path file database SQLite |
| `NODE_ENV` | `production` | Otomatis saat compile |
| `GEMINI_API_KEY` | (none) | Untuk `bun run commit` (opsional) |

---

## Konvensi Struktur Direktori

Proyek menerapkan **aturan mirroring**: struktur folder setiap lapisan mencerminkan struktur route-nya.

### Frontend (`src/app/`)

Setiap halaman adalah file `index.tsx` atau `$param.tsx` di dalam folder sesuai path URL-nya.

| URL | File |
|---|---|
| `/` | `src/app/index.tsx` |
| `/anggota` | `src/app/anggota/index.tsx` |
| `/anggota/123` | `src/app/anggota/$id/index.tsx` |
| `/anggota/123/edit` | `src/app/anggota/$id/edit.tsx` |
| `/anggota/123/pengukuran/tambah` | `src/app/anggota/$id/pengukuran/tambah.tsx` |
| `/anggota/123/pengukuran/456` | `src/app/anggota/$id/pengukuran/$pengukuranId.tsx` |
| `/anggota/barcode/123` | `src/app/anggota/barcode/$id.tsx` |
| `/anggota/tambah` | `src/app/anggota/tambah/index.tsx` |
| `/cari` | `src/app/cari/index.tsx` |
| `/pengaturan` | `src/app/pengaturan/index.tsx` |

### API Backend (`src/app/api/`)

| Endpoint | File |
|---|---|
| `GET /api/stats` | `src/app/api/stats/route.ts` |
| `GET /api/export` | `src/app/api/export/route.ts` |
| `GET/POST /api/peserta` | `src/app/api/peserta/route.ts` |
| `GET/PUT/DELETE /api/peserta/:id` | `src/app/api/peserta/[id]/route.ts` |
| `GET/POST /api/pendataan` | `src/app/api/pendataan/route.ts` |
| `GET/PUT/DELETE /api/pendataan/:id` | `src/app/api/pendataan/[id]/route.ts` |

> **Catatan:** File `index.ts`, `types.ts`, dan `route.ts` di dalam `src/app/api/` otomatis diabaikan oleh TanStack Router melalui `routeFileIgnorePattern` di `vite.config.ts`.

### Komponen (`src/components/`)

Komponen spesifik halaman diletakkan di subfolder yang mencerminkan route pemakaiannya. **Jangan** menaruh komponen khusus halaman langsung di root `src/components/`.

### Komponen Shadcn (`src/components/ui/`)

**Jangan pernah edit manual.** Selalu gunakan CLI:

```bash
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add card input label
bunx --bun shadcn@latest add    # Mode interaktif
```

---

## Error Handling

Proyek ini menerapkan **multi-layer error handling** agar robust:

### 1. Database (`src/db/connection.ts`)

- Gagal membuat direktori `data/` → `process.exit(1)`.
- Gagal membuka file SQLite → `process.exit(1)`.
- Gagal mengatur PRAGMA → `console.warn` (non-fatal).
- Gagal mengeksekusi file schema → `process.exit(1)`.

### 2. API Backend (`src/app/api/index.ts`)

- **Global error handler** via `app.onError()` menangkap semua exception yang tidak tertangani handler → response 500 JSON.
- **Per-handler wrapper** (`wrapHandler`) membungkus setiap route handler dengan try/catch → response 500 JSON dengan pesan error.

### 3. Server (`src/server.ts`)

- Validasi `PORT` (harus angka) → gunakan default 3000 jika invalid.
- Mode embedded vs filesystem di-handle secara terpisah.
- Fallback `index.html` untuk SPA routing.

### 4. Kompilasi (`scripts/compile.ts`)

- Setiap langkah (`vite build`, `bun build --compile`) dibungkus try/catch terpisah → exit dengan kode non-zero jika gagal.

### 5. Frontend

- Setiap `fetch` call sebaiknya dibungkus `try/catch`.
- Tersedia `window.showCustomAlert(message)` dan `window.showCustomConfirm(message)` untuk notifikasi user-friendly (bukan `alert()` native).

---

## Panduan Kontribusi

### Alur Kerja yang Disarankan

1. **Buat branch baru** untuk setiap fitur/fix:
   ```bash
   git checkout -b feat/nama-fitur
   ```

2. **Develop & test locally:**
   ```bash
   bun dev
   ```

3. **Jalankan verifikasi otomatis sebelum commit:**
   ```bash
   bun run verify
   ```
   Script ini akan memeriksa hal-hal kritis secara otomatis (lihat detail di bawah).

4. **Commit dengan AI auto-commit:**
   ```bash
   bun run commit
   ```
   AI akan memeriksa kebocoran secret, generate pesan commit, update version, dan update CHANGELOG. Pada akhir proses, script akan **menanyakan apakah ingin langsung push ke remote** (beserta tag versi), sehingga Anda tidak perlu melakukan `git push` manual secara terpisah.

5. **Buat Pull Request** di GitHub dan minta review dari anggota tim.

---

### Sistem Checklist Otomatis (`scripts/verify.ts`)

Untuk mencegah developer lupa dengan checklist sebelum commit, proyek ini menggunakan script `scripts/verify.ts` yang dijalankan via `bun run verify`.

Script ini mengotomatisasi pengecekan berikut secara **hardcoded**:
- ✅ `biome ci` lulus tanpa error
- ✅ `tsc -b` (TypeScript check) lulus tanpa error
- ✅ File baru `.sql` di `src/db/schema/` sudah didaftarkan di `schemaOrder` (error jika belum)
- ⚠️ Memberikan **warning pengingat** jika ada file konfigurasi fix yang diubah tanpa konfirmasi grup
- ⚠️ Memberikan **warning pengingat** jika `src/routeTree.gen.ts` atau `src/components/ui/*` diubah manual

---

### Checklist Manual (Tetap perlu perhatian developer)

Beberapa hal tidak bisa dicek otomatis oleh script, pastikan Anda manual mengecek:
- [ ] Halaman frontend = `index.tsx` / `$param.tsx` di folder route yang sesuai
- [ ] Endpoint API = `route.ts` dengan tipe eksplisit `NextRouteHandler<...>`
- [ ] Komponen diletakkan di subfolder yang mencerminkan route-nya
- [ ] Tidak ada secret/API key yang ter-commit (AI pada `bun run commit` juga akan mengecek ini)
- [ ] Jika mengubah file konfigurasi yang fix, sudah konfirmasi di grup (script `verify` akan memberikan warning pengingat)

---

### Konvensi Commit (Conventional Commits)

Script `bun run commit` otomatis menggunakan format ini, namun jika commit manual:

```
feat: menambahkan halaman laporan bulanan
fix: memperbaiki bug grafik pertumbuhan tidak muncul
refactor: menyederhanakan logika fetch data peserta
chore: update dependencies
docs: update README
style: format kode dengan biome
```

---

## FAQ & Tips

### Q: Bagaimana cara reset database dev?

```bash
rm data/dev.db
bun dev  # Database akan dibuat ulang otomatis
```

### Q: Bagaimana cara melihat isi database?

```bash
# Install sqlite3 jika belum ada
# Linux: sudo apt install sqlite3
# macOS: brew install sqlite

# Buka database
sqlite3 data/dev.db

# Perintah berguna:
.tables                          # List semua tabel
.schema peserta                  # Lihat struktur tabel peserta
SELECT * FROM peserta LIMIT 5;   # Lihat 5 data pertama
.quit                            # Keluar
```

### Q: Kenapa QR Code di-scan tidak terbaca?

Pastikan:
1. URL yang di-encode menggunakan **IP lokal** (bukan `localhost`) jika di-scan dari HP.
2. Aplikasi berjalan di port yang sama dengan saat QR di-generate.
3. HP dan server berada di **jaringan WiFi yang sama**.

### Q: Bagaimana cara mengganti kredensial admin?

Saat ini, kredensial admin **hardcoded** di `src/app/pengaturan/index.tsx`:

```tsx
if (username === "admin" && password === "Admin#1234") {
```

Untuk mengubah, edit baris tersebut. **Catatan:** Ini bukan autentikasi yang aman (hanya client-side). Untuk produksi yang serius, pertimbangkan untuk implementasi autentikasi server-side (JWT, session, dll).

### Q: Bagaimana cara menambahkan jenis pengukuran baru (misal: lingkar perut)?

1. **Tambah kolom di database** — Buat migration script:
   ```ts
   db.exec("ALTER TABLE pendataan ADD COLUMN lingkar_perut REAL;");
   ```

2. **Update file schema** — Edit `src/db/schema/pendataan.sql`, tambah `lingkar_perut REAL,`.

3. **Update type** — Edit `src/types/backend/pendataan/index.ts`:
   ```ts
   export interface Pendataan {
     // ... field lain
     lingkar_perut: number | null;
   }
   export interface PendataanInput {
     // ... field lain
     lingkar_perut?: number;
   }
   ```

4. **Update API** — Edit `src/app/api/pendataan/route.ts` (POST) dan `src/app/api/pendataan/[id]/route.ts` (PUT) untuk handle field baru.

5. **Update frontend** — Edit form di `src/app/anggota/$id/pengukuran/tambah.tsx` dan `src/app/anggota/$id/pengukuran/$pengukuranId.tsx`.

6. **Update export** — Edit `src/app/api/export/route.ts` untuk include kolom baru di Excel.

### Q: Bagaimana cara mengubah port server dev?

```bash
# Via environment variable
PORT=4000 bun dev
```

### Q: Kenapa `bun run commit` minta API Key?

Script commit menggunakan **Google Gemini AI** untuk menganalisis diff dan generate pesan commit. Anda memerlukan API Key gratis dari [Google AI Studio](https://aistudio.google.com/apikey). Key disimpan lokal di `.commit-auth.json` (sudah di-gitignore).

### Q: Bagaimana cara menonaktifkan AI auto-commit dan commit manual?

```bash
git add .
git commit -m "feat: deskripsi perubahan"
git push
```

Namun, Anda perlu **manual update** `package.json` version dan `CHANGELOG.md` jika tidak menggunakan AI.

### Q: Apakah aman menghapus folder `dist/` atau `build/`?

**Ya, aman.** Folder tersebut berisi hasil build yang bisa di-regenerate kapan saja dengan `bun run build` atau `bun run compile`.

### Q: Bagaimana cara berkontribusi jika saya baru pertama kali?

1. Baca README ini sampai habis.
2. Jalankan `bun digest` untuk melihat struktur kode lengkap.
3. Mulai dari issue kecil atau typo fix.
4. Tanyakan di grup jika ada yang tidak dipahami.

---

> Dibuat dengan Bun, Hono, React, TanStack, dan SQLite untuk PKM Posyandu.