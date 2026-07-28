import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Loader2,
  Ruler,
  ScanLine,
  Search,
  User,
  UserPlus,
  Users,
  Mars,
  Venus,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/anggota/")({
  component: MobileView,
});

interface Peserta {
  id: number;
  nama_anak: string;
  nama_ibu: string | null;
  nik: string;
  status: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  sudah_diperiksa?: number;
}

function MobileView() {
  const navigate = useNavigate();
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAdmin(localStorage.getItem("isLoggedIn") === "true");
    };
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  useEffect(() => {
    const fetchPeserta = async () => {
      try {
        const response = await fetch("/api/peserta");
        if (!response.ok) throw new Error("Gagal mengambil data");
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

  const getInitials = (name: string) => {
    if (!name) return "AN";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const calculateAgeInMonths = (birthDateStr?: string) => {
    if (!birthDateStr) return "Umur -";
    const birth = new Date(birthDateStr);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += now.getMonth();
    
    if (months < 0) return "0 Bulan";
    
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 
        ? `${years} Tahun ${remainingMonths} Bulan` 
        : `${years} Tahun`;
    }
    return `${months} Bulan`;
  };

  const filteredPeserta = pesertaList.filter(
    (anak) =>
      anak.nama_anak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anak.nik.includes(searchQuery),
  );

  return (
    <div className="w-full max-w-md md:max-w-5xl mx-auto flex flex-col flex-1 px-4 md:px-8">
      <div className="flex items-center gap-3 p-4 pt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            className="w-full pl-10 pr-12 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white shadow-sm text-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NIK..."
            type="text"
            value={searchQuery}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
            type="button"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>

        {isAdmin && (
          <Link className="flex-shrink-0" to="/anggota/tambah">
            <button
              className="p-3 border border-slate-200 rounded-2xl bg-white text-indigo-700 hover:bg-slate-50 transition-colors shadow-sm"
              type="button"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max items-start">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredPeserta.length > 0 ? (
          filteredPeserta.map((child) => (
            <Link
              className="relative bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100/50 overflow-hidden cursor-pointer hover:border-indigo-200 transition-colors"
              key={child.id}
              params={{ id: String(child.id) }}
              to="/anggota/info/$id"
            >
              {/* Left indicator border based on checked status */}
              <div 
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full transition-colors ${
                  child.sudah_diperiksa ? "bg-green-500" : "bg-orange-400"
                }`} 
              />

              <div className="flex items-center gap-4 pl-1">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 tracking-wider">
                  {getInitials(child.nama_anak)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 text-[15px] line-clamp-1">
                    {child.nama_anak}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                    {child.jenis_kelamin?.toUpperCase() === "L" || child.jenis_kelamin?.toUpperCase() === "LAKI-LAKI" || child.jenis_kelamin?.toUpperCase() === "LAKI_LAKI" ? (
                      <Mars className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <Venus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>{calculateAgeInMonths(child.tanggal_lahir)}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  className="text-indigo-800 p-2 hover:bg-indigo-50 rounded-full transition-colors z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate({
                      to: "/anggota/input/$pesertaId",
                      params: { pesertaId: String(child.id) },
                    });
                  }}
                  type="button"
                >
                  <Ruler className="w-5 h-5" />
                </button>
              )}
            </Link>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500 text-sm">
            Tidak ada data anggota ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
