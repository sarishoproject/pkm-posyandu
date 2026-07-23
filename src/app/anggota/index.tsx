import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { 
  Search, 
  ScanLine, 
  UserPlus, 
  Ruler, 
  Home, 
  Users, 
  User,
  Loader2
} from 'lucide-react';

export const Route = createFileRoute("/anggota/")({
  component: MobileView,
});

// Sesuaikan dengan interface dari backend
interface Peserta {
  id: number;
  nama_anak: string;
  nik: string;
  nama_ibu: string | null;
  status: string;
}

function MobileView() {
  const navigate = useNavigate();
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch data dari API saat komponen di-mount
  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        const response = await fetch('/api/peserta');
        if (!response.ok) throw new Error('Gagal mengambil data');
        const data = await response.json();
        setPesertaList(data);
      } catch (error) {
        console.error("Error fetching peserta:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPeserta();
  }, []);

  // 2. Fungsi Pembantu: Membuat Inisial Nama (Misal: "Aditya Pratama" -> "AP")
  const getInitials = (name: string) => {
    if (!name) return "AN";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // 3. Filter data berdasarkan pencarian
  const filteredPeserta = pesertaList.filter(anak => 
    anak.nama_anak.toLowerCase().includes(searchQuery.toLowerCase()) || 
    anak.nik.includes(searchQuery)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] max-w-md mx-auto relative font-sans text-slate-800 border-x">
      
      {/* Header & Search Bar */}
      <div className="flex items-center gap-3 p-4 pt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NIK..."
            className="w-full pl-10 pr-12 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white shadow-sm text-sm"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors">
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tombol Tambah Anggota (Revisi link ke /anggota/tambah) */}
        <Link to="/anggota/tambah" className="flex-shrink-0">
          <button className="p-3 border border-slate-200 rounded-2xl bg-white text-indigo-700 hover:bg-slate-50 transition-colors shadow-sm">
            <UserPlus className="w-5 h-5" />
          </button>
        </Link>
      </div>

      {/* List Anggota */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredPeserta.length > 0 ? (
          filteredPeserta.map((child) => (
            <div 
              key={child.id}
              onClick={() => navigate({ to: `/anggota/detail/${child.id}` as any })}
              className="relative bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100/50 overflow-hidden cursor-pointer hover:border-indigo-200 transition-colors"
            >
              {/* Indikator Aktif (Status) */}
              {child.status.toLowerCase() === 'aktif' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-orange-300 rounded-r-full" />
              )}

              <div className="flex items-center gap-4 pl-1">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 tracking-wider">
                  {getInitials(child.nama_anak)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 text-[15px] line-clamp-1">
                    {child.nama_anak}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">
                    {/* Karena Umur belum ada di DB, kita tampilkan NIK sebagai info sekunder */}
                    NIK: {child.nik}
                  </span>
                </div>
              </div>

              {/* Tombol Input Pengukuran */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Mencegah klik tombol memicu klik kartu (masuk ke detail)
                  navigate({ to: `/anggota/input/${child.id}` as any });
                }}
                className="text-indigo-800 p-2 hover:bg-indigo-50 rounded-full transition-colors z-10"
              >
                <Ruler className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500 text-sm">
            Tidak ada data anggota ditemukan.
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 flex justify-around pb-6 pt-3 px-2 z-10 rounded-t-xl">
        <Link 
          to="/" 
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-20 [&.active]:text-indigo-700"
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        
        <Link 
          to="/anggota" 
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-20 [&.active]:text-indigo-700"
        >
          <Users className="w-6 h-6" /> 
          <span className="text-[10px] font-medium">Anggota</span>
        </Link>
        
        <Link 
          to="/akun" 
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-20 [&.active]:text-indigo-700"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Akun</span>
        </Link>
      </div>
    </div>
  );
}