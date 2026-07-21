CREATE TABLE IF NOT EXISTS peserta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nik TEXT UNIQUE NOT NULL,
  nama_anak TEXT NOT NULL,
  nama_ibu TEXT,
  -- Status bisa: 'aktif', 'pindah', 'lolos' (berdasarkan Excel)
  status TEXT DEFAULT 'aktif',
  -- Data ASI Eksklusif (0-6 bulan) disimpan di sini karena sifatnya master data
  asi_bulan_0 TEXT DEFAULT 'tidak',
  asi_bulan_1 TEXT DEFAULT 'tidak',
  asi_bulan_2 TEXT DEFAULT 'tidak',
  asi_bulan_3 TEXT DEFAULT 'tidak',
  asi_bulan_4 TEXT DEFAULT 'tidak',
  asi_bulan_5 TEXT DEFAULT 'tidak',
  asi_bulan_6 TEXT DEFAULT 'tidak',
  -- QR Code untuk scan (dibuat unik)
  qr_code TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);