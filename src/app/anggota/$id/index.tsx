import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/anggota/$id/")({
  component: MemberDetailView,
});

interface DetailResponse {
  id: number;
  jenis_kelamin?: string;
  nama_anak: string;
  nama_ibu: string | null;
  nik: string;
  riwayat: {
    id: number;
    tanggal_ukur: string;
    berat: number | null;
    tinggi: number | null;
    lingkar_kepala?: number | null;
    lila?: number | null;
    cara_ukur?: string | null;
    pitting_edema?: string | null;
    asi?: string | null;
  }[];
  status: string;
  tanggal_lahir?: string;
}

type RiwayatItem = DetailResponse["riwayat"][number];

interface GraphPoint {
  date: string;
  fullDate: string;
  height: number;
  heightY: number;
  id: number;
  weight: number;
  weightY: number;
  x: number;
}

function MemberDetailView() {
  const { id } = Route.useParams();

  const [data, setData] = useState<DetailResponse | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<GraphPoint | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<RiwayatItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target;
      const scrollTop =
        target === document
          ? window.scrollY
          : (target as HTMLElement).scrollTop;
      setIsScrolled(scrollTop > 40);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      setIsAdmin(localStorage.getItem("isLoggedIn") === "true");
    };
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/peserta/${id}`);
        if (!response.ok) throw new Error("Data tidak ditemukan");

        const json = await response.json();
        setData(json);
        document.title = `${json.nama_anak} - Detail | Posyandu`;
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1E1B4B] animate-spin" />
      </div>
    );
  }

  const riwayatUrut = [...data.riwayat].reverse();

  const isBulanIni = (dateString: string) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    } catch {
      return false;
    }
  };

  const getMonthsAgoText = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMonths =
        (now.getFullYear() - date.getFullYear()) * 12 +
        (now.getMonth() - date.getMonth());
      if (diffMonths <= 0) return "";
      return `${diffMonths} Bulan Lalu`;
    } catch {
      return "";
    }
  };

  const graphData: GraphPoint[] = riwayatUrut.map((item, index) => {
    const spacingX =
      riwayatUrut.length > 1 ? 360 / (riwayatUrut.length - 1) : 180;
    const x = 20 + index * spacingX;

    const berat = item.berat || 0;
    let weightY = 160 - berat * 5;

    const tinggi = item.tinggi || 0;
    let heightY = 160 - (tinggi - 40) * 1.5;

    weightY = Math.max(15, Math.min(185, weightY));
    heightY = Math.max(15, Math.min(185, heightY));

    const dateObj = new Date(item.tanggal_ukur);
    const shortBulan = dateObj.toLocaleDateString("id-ID", { month: "short" });
    const tahun = dateObj.getFullYear();

    return {
      id: item.id,
      date: shortBulan,
      fullDate: `${shortBulan} ${tahun}`,
      x,
      weight: berat,
      weightY,
      height: tinggi,
      heightY,
    };
  });

  const weightPath = `M ${graphData.map((d) => `${d.x} ${d.weightY}`).join(" L ")}`;
  const heightPath = `M ${graphData.map((d) => `${d.x} ${d.heightY}`).join(" L ")}`;

  const dataTerbaru = data.riwayat[0];
  const inisial = data.nama_anak.substring(0, 2).toUpperCase();

  const formatTanggalLahir = (tgl?: string) => {
    if (!tgl) return "-";
    return new Date(tgl).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const hitungUmur = (tglLahir?: string) => {
    if (!tglLahir) return "-";
    const lahir = new Date(tglLahir);
    const sekarang = new Date();

    let tahun = sekarang.getFullYear() - lahir.getFullYear();
    let bulan = sekarang.getMonth() - lahir.getMonth();

    if (bulan < 0 || (bulan === 0 && sekarang.getDate() < lahir.getDate())) {
      tahun--;
      bulan += 12;
    }

    if (tahun <= 0 && bulan <= 0) return `0 Bulan`;
    if (tahun === 0) return `${bulan} Bulan`;
    if (bulan === 0) return `${tahun} Tahun`;
    return `${tahun} Tahun ${bulan} Bulan`;
  };

  const handleDeleteHistory = async (idRiwayat: number) => {
    const confirmed = await window.showCustomConfirm(
      "Yakin ingin menghapus data pengukuran ini? Data yang dihapus tidak bisa dikembalikan.",
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/pendataan/${idRiwayat}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus data dari server");
      }

      setData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          riwayat: prevData.riwayat.filter((item) => item.id !== idRiwayat),
        };
      });

      setSelectedHistory(null);
      await window.showCustomAlert("Data pengukuran berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting history:", error);
      await window.showCustomAlert(
        "Terjadi kesalahan saat menghapus data pengukuran.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-5xl mx-auto flex flex-col relative min-h-screen pb-28 md:pb-10 px-4 md:px-8">
      <div className="sticky top-0 bg-[#F8F9FA]/90 backdrop-blur-md py-4 flex items-center border-b border-slate-100 z-20">
        <button
          className="p-2 -ml-2 text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          onClick={() => navigate({ to: "/anggota" })}
          type="button"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <span
          className={`ml-2 text-base font-bold text-slate-800 truncate transition-all duration-300 transform ${isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
        >
          {data.nama_anak}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 md:pb-8 md:p-8">
        <div className="md:grid md:grid-cols-2 md:gap-12">
          {/* KOLOM KIRI */}
          <div className="flex flex-col px-5 md:px-0">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-[#E0E7FF] text-[#1E1B4B] flex items-center justify-center font-bold text-3xl shrink-0">
                {inisial}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="font-bold text-slate-900 text-lg leading-tight truncate">
                  {data.nama_anak}
                </h2>
                <div className="flex flex-col mt-2 space-y-0.5">
                  <span className="text-xs text-slate-500 font-semibold">
                    NIK: {data.nik}
                  </span>
                  <span className="text-xs text-slate-500">
                    Tgl Lahir: {formatTanggalLahir(data.tanggal_lahir)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {hitungUmur(data.tanggal_lahir)} &bull;{" "}
                    {data.jenis_kelamin || "Laki-laki"}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="grid grid-cols-3 gap-2 w-full mb-8">
                {/* <button
                  className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                  onClick={handleExportSingleUser}
                  type="button"
                >
                  <Download className="w-3.5 h-3.5" />
                  Excel
                </button> */}
                <Link
                  className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm text-center"
                  // className="flex items-center justify-center gap-1.5 text-indigo-850 bg-indigo-50/60 border border-indigo-100/70 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-indigo-100/60 text-center"
                  params={{ id }}
                  to="/anggota/barcode/$id"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR
                </Link>
                <Link
                  className="flex items-center justify-center gap-1.5 text-indigo-855 bg-indigo-50/60 border border-indigo-100/70 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-indigo-100/60 text-center"
                  params={{ id }}
                  to="/anggota/$id/edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </div>
            )}

            <div className="mb-8">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-800 text-[15px]">
                  Grafik Pertumbuhan
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Ketuk area titik pada grafik untuk melihat detail angka.
                </p>
              </div>

              <div className="bg-[#F8F9FA] rounded-2xl p-4 md:border md:border-slate-100 md:shadow-sm">
                {graphData.length > 0 ? (
                  <div className="relative w-full h-[220px]">
                    <svg
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                      viewBox="0 0 400 200"
                    >
                      <title>Grafik Pertumbuhan Anak</title>
                      <line
                        stroke="#E2E8F0"
                        strokeWidth="1.5"
                        x1="0"
                        x2="400"
                        y1="40"
                        y2="40"
                      />
                      <line
                        stroke="#E2E8F0"
                        strokeWidth="1.5"
                        x1="0"
                        x2="400"
                        y1="100"
                        y2="100"
                      />
                      <line
                        stroke="#E2E8F0"
                        strokeWidth="1.5"
                        x1="0"
                        x2="400"
                        y1="160"
                        y2="160"
                      />

                      <path
                        d={heightPath}
                        fill="none"
                        stroke="#FDBA74"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3.5"
                      />
                      <path
                        d={weightPath}
                        fill="none"
                        stroke="#1E1B4B"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3.5"
                      />

                      {graphData.map((d) => {
                        const isSelected = selectedPoint?.id === d.id;

                        return (
                          // biome-ignore lint/a11y/noStaticElementInteractions: SVG chart point
                          <g
                            className="cursor-pointer outline-none"
                            key={d.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPoint(isSelected ? null : d);
                            }}
                          >
                            <rect
                              fill="transparent"
                              height="200"
                              width="40"
                              x={d.x - 20}
                              y="0"
                            />

                            {isSelected && (
                              <line
                                stroke="#94A3B8"
                                strokeDasharray="4 4"
                                strokeWidth="1.5"
                                x1={d.x}
                                x2={d.x}
                                y1="20"
                                y2="160"
                              />
                            )}

                            <circle
                              cx={d.x}
                              cy={d.heightY}
                              fill={isSelected ? "#FFF" : "#FDBA74"}
                              r={isSelected ? "5" : "3.5"}
                              stroke="#FDBA74"
                              strokeWidth={isSelected ? "2" : "0"}
                            />
                            <circle
                              cx={d.x}
                              cy={d.weightY}
                              fill={isSelected ? "#FFF" : "#1E1B4B"}
                              r={isSelected ? "5" : "3.5"}
                              stroke="#1E1B4B"
                              strokeWidth={isSelected ? "2" : "0"}
                            />

                            <text
                              fill={isSelected ? "#1E1B4B" : "#64748B"}
                              fontSize="11"
                              fontWeight={isSelected ? "700" : "500"}
                              textAnchor="middle"
                              x={d.x}
                              y="185"
                            >
                              {d.date}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {selectedPoint && (
                      <div
                        className="absolute bg-white shadow-lg border border-slate-100 rounded-xl p-2.5 flex flex-col gap-1 w-28 pointer-events-none transition-all duration-200 z-20"
                        style={{
                          left: `${(selectedPoint.x / 400) * 100}%`,
                          top: `${(Math.min(selectedPoint.heightY, selectedPoint.weightY) / 200) * 100}%`,
                          transform: "translate(-50%, -115%)",
                        }}
                      >
                        <span className="text-[11px] font-bold text-slate-800 text-center mb-0.5 border-b border-slate-100 pb-1">
                          {selectedPoint.fullDate}
                        </span>
                        <div className="flex items-center justify-between text-[11px] mt-0.5">
                          <span className="text-slate-500">Berat</span>
                          <span className="font-bold text-[#1E1B4B]">
                            {selectedPoint.weight} kg
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Tinggi</span>
                          <span className="font-bold text-[#FDBA74]">
                            {selectedPoint.height} cm
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 flex items-center justify-center">
                    <span className="text-sm text-slate-400">
                      Belum ada data grafik.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#1E1B4B]"></div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Berat Badan
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#FDBA74]"></div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Tinggi Badan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-b border-slate-200 divide-y divide-slate-100 mb-8 md:mb-0">
              {/* Row 1: Berat & Tinggi */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1 flex flex-col items-center border-r border-slate-200">
                  <span className="text-[10px] text-slate-500 mb-1">
                    Berat Badan (Terakhir)
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {dataTerbaru?.berat ? `${dataTerbaru.berat} kg` : "-"}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 mb-1">
                    Tinggi Badan (Terakhir)
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {dataTerbaru?.tinggi ? `${dataTerbaru.tinggi} cm` : "-"}
                  </span>
                </div>
              </div>

              {/* Row 2: Lingkar Kepala & LILA */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1 flex flex-col items-center border-r border-slate-200">
                  <span className="text-[10px] text-slate-500 mb-1">
                    Lingkar Kepala (Terakhir)
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {dataTerbaru?.lingkar_kepala
                      ? `${dataTerbaru.lingkar_kepala} cm`
                      : "-"}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 mb-1">
                    LILA (Terakhir)
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {dataTerbaru?.lila ? `${dataTerbaru.lila} cm` : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 md:hidden mb-6"></div>

          {/* KOLOM KANAN */}
          <div className="flex flex-col px-5 md:px-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-800 text-[15px]">
                Riwayat Pengukuran
              </h3>
              {isAdmin && (
                <Link
                  className="hidden md:flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-700 transition-colors"
                  params={{ id }}
                  to="/anggota/$id/pengukuran/tambah"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {data.riwayat.length > 0 ? (
                data.riwayat.map((item, index) => {
                  return (
                    <div
                      className="bg-white md:bg-slate-50 md:border md:border-slate-100 rounded-2xl overflow-hidden transition-all duration-200 border border-slate-100/80 shadow-sm hover:shadow-md hover:border-indigo-100"
                      key={item.id}
                    >
                      <button
                        className="w-full flex items-center justify-between p-4 cursor-pointer text-left hover:bg-slate-50/50 transition-colors"
                        onClick={() => setSelectedHistory(item)}
                        type="button"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar
                            className={`w-4 h-4 shrink-0 ${index === 0 ? "text-indigo-650 font-bold" : "text-slate-400"}`}
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {new Date(item.tanggal_ukur).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <div className="flex items-center gap-1">
                              {index === 0 && (
                                <span className="text-[7.5px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 mt-0.5 rounded-md font-bold uppercase tracking-wider w-max">
                                  Terbaru
                                </span>
                              )}
                              {isBulanIni(item.tanggal_ukur) ? (
                                <span className="text-[7.5px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 mt-0.5 rounded-md font-bold uppercase tracking-wider w-max">
                                  Bulan Ini
                                </span>
                              ) : (
                                index === 0 &&
                                getMonthsAgoText(item.tanggal_ukur) && (
                                  <span className="text-[7.5px] bg-amber-50 text-amber-700 px-1.5 py-0.5 mt-0.5 rounded-md font-bold uppercase tracking-wider w-max">
                                    {getMonthsAgoText(item.tanggal_ukur)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-4 text-right">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">
                                Berat
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {item.berat || "-"} kg
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">
                                Tinggi
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {item.tinggi || "-"} cm
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Belum ada riwayat pengukuran.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL POP-UP DETAIL RIWAYAT */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          {/* Tombol backdrop transparan untuk menutup modal (tanpa melanggar a11y) */}
          <button
            aria-label="Tutup detail"
            className="absolute inset-0 z-10 cursor-default"
            onClick={() => setSelectedHistory(null)}
            type="button"
          />

          <div className="relative z-20 bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#F8F9FA]">
              <h3 className="font-bold text-slate-800 text-[15px]">
                Detail Pengukuran
              </h3>
              <button
                className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                onClick={() => setSelectedHistory(null)}
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Konten Modal */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-xs text-slate-500 font-medium">
                  Tanggal Diukur
                </span>
                <span className="text-sm font-bold text-[#1E1B4B]">
                  {new Date(selectedHistory.tanggal_ukur).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">
                    Berat Badan
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {selectedHistory.berat || "-"}{" "}
                    <span className="text-xs text-slate-500 font-normal">
                      kg
                    </span>
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold">
                    Tinggi Badan
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {selectedHistory.tinggi || "-"}{" "}
                    <span className="text-xs text-slate-500 font-normal">
                      cm
                    </span>
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Lingkar Kepala</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedHistory.lingkar_kepala
                      ? `${selectedHistory.lingkar_kepala} cm`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    Lingkar Lengan (LILA)
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedHistory.lila ? `${selectedHistory.lila} cm` : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Cara Ukur</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedHistory.cara_ukur || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Pitting Edema</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedHistory.pitting_edema || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">asi</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedHistory.asi || "-"}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin ? (
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-650 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed border border-red-100"
                  disabled={isDeleting}
                  onClick={() => handleDeleteHistory(selectedHistory.id)}
                  type="button"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {isDeleting ? "Hapus..." : "Hapus"}
                </button>

                <Link
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-750 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-sm font-bold transition-colors"
                  params={{
                    id,
                    pengukuranId: String(selectedHistory.id),
                  }}
                  to="/anggota/$id/pengukuran/$pengukuranId"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border-t border-slate-100">
                <button
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  onClick={() => setSelectedHistory(null)}
                  type="button"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Add Measurement Button for Mobile */}
      {isAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-30 md:hidden no-print">
          <button
            className="w-full py-3.5 bg-[#1E1B4B] hover:bg-indigo-900 text-white rounded-2xl font-bold text-xs shadow-[0_8px_24px_rgba(30,27,75,0.25)] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
            onClick={() =>
              navigate({ to: "/anggota/$id/pengukuran/tambah", params: { id } })
            }
            type="button"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengukuran Baru
          </button>
        </div>
      )}
    </div>
  );
}
