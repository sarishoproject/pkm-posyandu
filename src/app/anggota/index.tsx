import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Mars, Ruler, ScanLine, Search, Venus } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/anggota/")({
  component: MobileView,
});

interface Peserta {
  id: number;
  jenis_kelamin?: string;
  nama_anak: string;
  nama_ibu: string | null;
  nik: string;
  status: string;
  sudah_diperiksa?: number;
  tanggal_lahir?: string;
}

function MobileView() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Daftar Anggota | Posyandu";
  }, []);
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"semua" | "sudah" | "belum">(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const filterParam = params.get("filter");
        if (filterParam === "sudah" || filterParam === "belum")
          return filterParam;
      }
      return "semua";
    },
  );
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get("filter");
    if (filterParam === "sudah" || filterParam === "belum") {
      setActiveFilter(filterParam);
    } else {
      setActiveFilter("semua");
    }
  }, [location.search]);
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

  const filteredPeserta = pesertaList.filter((child) => {
    if (activeFilter === "sudah") return !!child.sudah_diperiksa;
    if (activeFilter === "belum") return !child.sudah_diperiksa;
    return true;
  });

  const sudahCount = pesertaList.filter((p) => p.sudah_diperiksa).length;
  const belumCount = pesertaList.filter((p) => !p.sudah_diperiksa).length;
  const totalCount = pesertaList.length;

  return (
    <div className="w-full max-w-md md:max-w-5xl mx-auto flex flex-col flex-1 px-4 md:px-8">
      <div className="px-4 pt-6 pb-1">
        <Link
          className="w-full flex items-center pl-11 pr-12 h-14 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm text-slate-400 cursor-pointer relative"
          to="/cari"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <span>Telusuri</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-850 transition-colors">
            <ScanLine className="w-5 h-5" />
          </span>
        </Link>
      </div>

      <div className="flex justify-end items-center gap-5 px-4 py-3">
        <button
          className={`text-xs font-bold transition-all cursor-pointer ${activeFilter === "semua" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          onClick={() => {
            setActiveFilter("semua");
            navigate({ to: "/anggota", search: {} });
          }}
          type="button"
        >
          Semua
        </button>
        <button
          className={`text-xs font-bold transition-all cursor-pointer ${activeFilter === "sudah" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          onClick={() => {
            setActiveFilter("sudah");
            navigate({ to: "/anggota", search: { filter: "sudah" } });
          }}
          type="button"
        >
          Sudah
          {sudahCount > 0 && sudahCount < totalCount ? ` (${sudahCount})` : ""}
        </button>
        <button
          className={`text-xs font-bold transition-all cursor-pointer ${activeFilter === "belum" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          onClick={() => {
            setActiveFilter("belum");
            navigate({ to: "/anggota", search: { filter: "belum" } });
          }}
          type="button"
        >
          Belum
          {belumCount > 0 && belumCount < totalCount ? ` (${belumCount})` : ""}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max items-start">
        {isLoading ? (
          ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((itemKey) => (
            <div
              className="bg-white border border-slate-100/70 p-4 rounded-2xl flex items-center justify-between shadow-sm animate-pulse"
              key={itemKey}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0" />
                <div className="flex flex-col flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-slate-100 rounded-md" />
                  <div className="w-1/2 h-3.5 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
            </div>
          ))
        ) : filteredPeserta.length > 0 ? (
          filteredPeserta.map((child) => (
            <Link
              className="relative bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100/50 overflow-hidden cursor-pointer hover:border-indigo-200 transition-colors"
              key={child.id}
              params={{ id: String(child.id) }}
              to="/anggota/$id"
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
                    {child.jenis_kelamin?.toUpperCase() === "L" ||
                    child.jenis_kelamin?.toUpperCase() === "LAKI-LAKI" ||
                    child.jenis_kelamin?.toUpperCase() === "LAKI_LAKI" ? (
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
                      to: "/anggota/$id/pengukuran/tambah",
                      params: { id: String(child.id) },
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
