CREATE TABLE IF NOT EXISTS pendataan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  peserta_id INTEGER NOT NULL,
  tanggal_ukur DATE NOT NULL,
  berat REAL,
  tinggi REAL,
  lila REAL, -- Lingkar Lengan Atas
  lingkar_kepala REAL,
  pitting_edema TEXT, -- 'ya', 'tidak', atau null
  cara_ukur TEXT, -- 'berdiri', 'berbaring', atau null
  vita TEXT, -- 'ya', 'tidak', atau null
  kelas_ibu_balita TEXT, -- 'ya', 'tidak', atau null
  mbg TEXT, -- 'ya', 'tidak', atau null
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (peserta_id) REFERENCES peserta(id) ON DELETE CASCADE
);