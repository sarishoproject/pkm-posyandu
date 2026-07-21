export interface Peserta {
  asi_bulan_0: string;
  asi_bulan_1: string;
  asi_bulan_2: string;
  asi_bulan_3: string;
  asi_bulan_4: string;
  asi_bulan_5: string;
  asi_bulan_6: string;
  created_at: string;
  id: number;
  nama_anak: string;
  nama_ibu: string | null;
  nik: string;
  qr_code: string | null;
  status: string;
}

// Buat input API (insert/update)
export interface PesertaInput {
  asi_bulan_0?: string;
  asi_bulan_1?: string;
  asi_bulan_2?: string;
  asi_bulan_3?: string;
  asi_bulan_4?: string;
  asi_bulan_5?: string;
  asi_bulan_6?: string;
  nama_anak: string;
  nama_ibu?: string;
  nik: string;
  qr_code?: string;
  status?: string;
}
