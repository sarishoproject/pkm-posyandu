import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Ruler,
  ScanLine,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/cari/")({
  component: CariPage,
});

interface Peserta {
  id: number;
  nama_anak: string;
  nik: string;
  status: string;
  sudah_diperiksa?: number;
}

// Fuzzy Match Helper Function
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const cleanText = text.toLowerCase().replace(/\s+/g, "");
  const cleanQuery = query.toLowerCase().replace(/\s+/g, "");
  let queryIdx = 0;
  for (let textIdx = 0; textIdx < cleanText.length; textIdx++) {
    if (cleanText[textIdx] === cleanQuery[queryIdx]) {
      queryIdx++;
      if (queryIdx === cleanQuery.length) return true;
    }
  }
  return false;
}

function CariPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Cari Anggota | Posyandu";
  }, []);

  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [historyList, setHistoryList] = useState<Peserta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAdmin(localStorage.getItem("isLoggedIn") === "true");
    };
    checkAuth();
    window.addEventListener("auth-change", checkAuth);

    // Load recent searches
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error("Gagal memuat riwayat pencarian:", e);
      }
    }

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

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const addToHistory = (child: Peserta) => {
    const cleanItem = {
      id: child.id,
      nama_anak: child.nama_anak,
      nik: child.nik,
      status: child.status,
      sudah_diperiksa: child.sudah_diperiksa,
    };
    setHistoryList((prev) => {
      const filtered = prev.filter((item) => item.id !== child.id);
      const updated = [cleanItem, ...filtered].slice(0, 5);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const filteredPeserta = pesertaList.filter(
    (anak) =>
      fuzzyMatch(anak.nama_anak, searchQuery) || anak.nik.includes(searchQuery),
  );

  const visiblePeserta = showAll
    ? filteredPeserta
    : filteredPeserta.slice(0, 5);

  const isQueryEmpty = !searchQuery.trim();

  return (
    <div className="w-full max-w-md md:max-w-2xl mx-auto flex flex-col flex-1 px-4 md:px-6">
      <div className="flex items-center gap-3 p-4 pt-6 border-b border-slate-200/50">
        <button
          className="p-1 text-slate-500 hover:text-indigo-750 transition-colors cursor-pointer shrink-0"
          onClick={() => window.history.back()}
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <input
            className="w-full py-2 bg-transparent focus:outline-none text-sm text-slate-800 placeholder-slate-400"
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAll(false);
            }}
            placeholder="Cari nama atau NIK..."
            ref={inputRef}
            type="text"
            value={searchQuery}
          />
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
            type="button"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-indigo-650 animate-spin" />
          </div>
        ) : isQueryEmpty ? (
          // Display Search History
          <div className="flex flex-col h-full">
            {historyList.length > 0 && (
              <div className="flex flex-col divide-y divide-slate-100/60 pt-2 mb-4">
                {historyList.map((child) => (
                  <Link
                    className="w-full flex items-center justify-between py-3 hover:opacity-75 transition-all text-left cursor-pointer"
                    key={child.id}
                    params={{ id: String(child.id) }}
                    to="/anggota/$id"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 text-sm">
                        {child.nama_anak}
                      </span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        child.sudah_diperiksa ? "bg-green-500" : "bg-orange-400"
                      }`}
                    />
                  </Link>
                ))}
              </div>
            )}

            {/* Aksi Cepat / Shortcut Buttons */}
            <div className="pt-2 space-y-1">
              <Link
                className="w-full flex items-center justify-between py-3 hover:opacity-75 transition-all cursor-pointer text-left border-b border-slate-100/60"
                search={{ filter: "belum" }}
                to="/anggota"
              >
                <span className="text-slate-700 text-xs font-semibold">
                  Cari yang belum diukur bulan ini
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                className="w-full flex items-center justify-between py-3 hover:opacity-75 transition-all cursor-pointer text-left"
                search={{ filter: "sudah" }}
                to="/anggota"
              >
                <span className="text-slate-700 text-xs font-semibold">
                  Cari yang sudah diukur bulan ini
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        ) : visiblePeserta.length > 0 ? (
          // Display Search Results
          <div className="flex flex-col divide-y divide-slate-100">
            {visiblePeserta.map((child) => (
              <Link
                className="w-full flex items-center justify-between py-3.5 hover:opacity-75 transition-all text-left cursor-pointer"
                key={child.id}
                onClick={() => addToHistory(child)}
                params={{ id: String(child.id) }}
                to="/anggota/$id"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800 text-sm">
                    {child.nama_anak}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      child.sudah_diperiksa ? "bg-green-500" : "bg-orange-400"
                    }`}
                  />
                  {isAdmin && (
                    <button
                      className="text-indigo-800 p-2 hover:bg-indigo-50 rounded-full transition-colors z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToHistory(child);
                        navigate({
                          to: "/anggota/$id/pengukuran/tambah",
                          params: { id: String(child.id) },
                        });
                      }}
                      type="button"
                    >
                      <Ruler className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Link>
            ))}

            {filteredPeserta.length > 5 && !showAll && (
              <button
                className="w-full flex items-center justify-center gap-1.5 py-4 text-xs font-bold text-slate-500 hover:text-indigo-650 transition-colors cursor-pointer"
                onClick={() => setShowAll(true)}
                type="button"
              >
                <span>
                  Tampilkan lebih banyak ({filteredPeserta.length - 5} lainnya)
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-sm">
            Tidak ada data anggota ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
