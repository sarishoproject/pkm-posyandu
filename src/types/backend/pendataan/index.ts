export interface Pendataan {
  berat: number | null;
  cara_ukur: string | null;
  created_at: string;
  id: number;
  kelas_ibu_balita: string | null;
  lila: number | null;
  lingkar_kepala: number | null;
  mbg: string | null;
  peserta_id: number;
  pitting_edema: string | null;
  tanggal_ukur: string; // Format: YYYY-MM-DD
  tinggi: number | null;
  vita: string | null;
}

export interface PendataanInput {
  berat?: number;
  cara_ukur?: string;
  kelas_ibu_balita?: string;
  lila?: number;
  lingkar_kepala?: number;
  mbg?: string;
  peserta_id: number;
  pitting_edema?: string;
  tanggal_ukur: string;
  tinggi?: number;
  vita?: string;
}
