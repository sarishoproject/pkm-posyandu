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