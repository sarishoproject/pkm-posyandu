import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: DashboardHome,
});

interface StatsResponse {
  belum_periksa_bulan_ini: number;
  pemeriksaan_bulan_ini: {
    id: number;
    nama_panggilan: string;
    berat: number;
    tinggi: number;
  }[];
  rata_rata_pertumbuhan: {
    bulan: string;
    rata_berat: number;
    rata_tinggi: number;
  }[];
  sudah_periksa_bulan_ini: number;
  total_pemeriksaan: number;
  total_peserta: number;
  tren_bulanan: { bulan: string; jumlah: number }[];
}

function SebaranBulanIniChart({
  data,
  metric,
}: {
  data: StatsResponse["pemeriksaan_bulan_ini"];
  metric: "berat" | "tinggi";
}) {
  const unit = metric === "berat" ? "kg" : "cm";

  if (!data || data.length === 0) return null;

  const values = data.map((item) => item[metric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round((sum / values.length) * 10) / 10;

  const minItem = data.find((item) => item[metric] === minVal);
  const maxItem = data.find((item) => item[metric] === maxVal);

  const width = 340;
  const height = 130;
  const paddingX = 20;
  const paddingY = 20;

  const valueRange = maxVal - minVal || 1;
  const yMinBound = minVal - valueRange * 0.15;
  const yMaxBound = maxVal + valueRange * 0.15;
  const drawRange = yMaxBound - yMinBound;

  const points = data.map((item, idx) => {
    const x =
      paddingX + (idx * (width - paddingX * 2)) / Math.max(1, data.length - 1);
    const val = item[metric];
    const y =
      height -
      paddingY -
      ((val - yMinBound) / drawRange) * (height - paddingY * 2);
    const isMin = item.id === minItem?.id && val === minVal;
    const isMax = item.id === maxItem?.id && val === maxVal;
    return { x, y, val, label: item.nama_panggilan, isMin, isMax, id: item.id };
  });

  const avgY =
    height -
    paddingY -
    ((avg - yMinBound) / drawRange) * (height - paddingY * 2);
  const color = metric === "berat" ? "rgb(37, 99, 235)" : "rgb(217, 119, 6)";

  const maxPoint = points.find((p) => p.isMax);
  const minPoint = points.find((p) => p.isMin);

  return (
    <div className="flex flex-col space-y-4 pt-1">
      {/* SVG Chart Container */}
      <div className="relative h-[135px] w-full overflow-visible select-none">
        <svg
          className="overflow-visible"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
        >
          <title>Sebaran Bulan Ini</title>
          {/* Grid lines */}
          <line
            stroke="#F8FAFC"
            strokeWidth="1"
            x1={paddingX}
            x2={width - paddingX}
            y1={paddingY}
            y2={paddingY}
          />
          <line
            stroke="#F8FAFC"
            strokeWidth="1"
            x1={paddingX}
            x2={width - paddingX}
            y1={height / 2}
            y2={height / 2}
          />

          {/* Average Dashed Line */}
          <line
            stroke="#94A3B8"
            strokeDasharray="4 4"
            strokeOpacity="0.6"
            strokeWidth="1.25"
            x1={paddingX}
            x2={width - paddingX}
            y1={avgY}
            y2={avgY}
          />
          <text
            className="text-[8px] font-bold fill-slate-400 font-sans"
            x={width - paddingX - 45}
            y={avgY - 4}
          >
            Rata-rata: {avg}
          </text>

          {/* Connect line */}
          <path
            d={points
              .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ")}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeOpacity="0.15"
            strokeWidth="2"
          />

          {/* Dots */}
          {points
            .filter((p) => p.isMin || p.isMax)
            .map((p) => (
              <circle
                cx={p.x}
                cy={p.y}
                fill={p.isMin ? "#475569" : color}
                key={p.id}
                r="4"
                stroke="white"
                strokeWidth="1.5"
              />
            ))}
        </svg>

        {/* HTML overlay tooltips for perfect text rendering and auto-scaling width */}
        {maxPoint && (
          <div
            className="absolute -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1 select-none pointer-events-none text-white transition-all duration-300"
            style={{
              left: `${(maxPoint.x / width) * 100}%`,
              top: `${(maxPoint.y / height) * 100 - 15}px`,
              backgroundColor: color,
            }}
          >
            <span>
              {maxPoint.label} ({maxPoint.val}
              {unit})
            </span>
            <div
              className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45"
              style={{ backgroundColor: color }}
            />
          </div>
        )}

        {minPoint && (
          <div
            className="absolute -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1 select-none pointer-events-none text-white transition-all duration-300"
            style={{
              left: `${(minPoint.x / width) * 100}%`,
              top: `${(minPoint.y / height) * 100 + 8}px`,
              backgroundColor: "#475569",
            }}
          >
            <span>
              {minPoint.label} ({minPoint.val}
              {unit})
            </span>
            <div className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#475569]" />
          </div>
        )}
      </div>
    </div>
  );
}

function TradingViewLineChart({
  data,
  dataKey,
  title,
  color,
  unit,
}: {
  data: { bulan: string; [key: string]: number | string }[];
  dataKey: string;
  title: string;
  color: string;
  unit: string;
}) {
  const values = data.map((item) => Number(item[dataKey]) || 0);
  const minVal = Math.min(...values) * 0.95; // 5% padding bottom
  const maxVal = Math.max(...values) * 1.05; // 5% padding top
  const range = maxVal - minVal || 1;

  const width = 160;
  const height = 90;
  const paddingX = 15;
  const paddingY = 12;

  const points = data.map((item, idx) => {
    const x =
      paddingX + (idx * (width - paddingX * 2)) / Math.max(1, data.length - 1);
    const val = Number(item[dataKey]) || 0;
    const y =
      height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
    return { x, y, val, label: item.bulan };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : "";

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-100/50 shadow-sm flex flex-col space-y-1.5 overflow-hidden">
      <div className="flex justify-between items-baseline">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-xs font-black text-slate-800">
          {values[values.length - 1] || "-"}{" "}
          <span className="text-[9px] text-slate-500 font-normal">{unit}</span>
        </span>
      </div>
      <div className="flex justify-center items-end relative h-[90px] w-full overflow-visible">
        <svg
          className="overflow-visible"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
        >
          <title>hello</title>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            stroke="#F1F5F9"
            strokeDasharray="2 2"
            strokeWidth="0.75"
            x1={paddingX}
            x2={width - paddingX}
            y1={paddingY}
            y2={paddingY}
          />
          <line
            stroke="#F1F5F9"
            strokeDasharray="2 2"
            strokeWidth="0.75"
            x1={paddingX}
            x2={width - paddingX}
            y1={height / 2}
            y2={height / 2}
          />
          <line
            stroke="#E2E8F0"
            strokeWidth="1"
            x1={paddingX}
            x2={width - paddingX}
            y1={height - paddingY}
            y2={height - paddingY}
          />

          {/* Area under the line */}
          {areaPath && <path d={areaPath} fill={`url(#grad-${dataKey})`} />}

          {/* Line path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          )}

          {/* Data Points */}
          {points.map((p) => (
            <g key={p.label}>
              <circle
                cx={p.x}
                cy={p.y}
                fill="white"
                r="2.5"
                stroke={color}
                strokeWidth="1.5"
              />
              {/* Value labels */}
              <text
                className="text-[8px] font-bold fill-slate-800 font-sans"
                textAnchor="middle"
                x={p.x}
                y={p.y - 6}
              >
                {p.val}
              </text>
              {/* Axis labels */}
              <text
                className="text-[7px] font-semibold fill-slate-400 font-sans"
                textAnchor="middle"
                x={p.x}
                y={height - 2}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function DashboardHome() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<"berat" | "tinggi">("berat");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    document.title = "Beranda | Posyandu";
  }, []);

  // Month navigation state: YYYY-MM
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const maxMonth = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  const isNextDisabled = currentMonth >= maxMonth;

  useEffect(() => {
    const checkAuth = () => {
      setIsAdmin(localStorage.getItem("isLoggedIn") === "true");
    };
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true); // Fix: always set true to prevent stale UI flash
        const response = await fetch(`/api/stats?month=${currentMonth}`);
        if (!response.ok) throw new Error("Gagal mengambil statistik");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentMonth]);

  const handleExport = () => {
    window.open("/api/export", "_blank");
  };

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 15);
    const newStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(newStr);
  };

  const handleNextMonth = () => {
    if (isNextDisabled) return;
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month, 15);
    const newStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(newStr);
  };

  const formatMonthLabel = (yearMonthStr: string) => {
    const [year, month] = yearMonthStr.split("-");
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 15);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  };

  if (isLoading || !stats) {
    return (
      <div className="flex-1 flex flex-col p-4 xs:p-6 max-w-md mx-auto space-y-6 pb-12 animate-pulse">
        {/* Hero skeleton */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-[2.25rem] p-6 flex flex-col space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="w-24 h-6 bg-indigo-200/50 rounded-md" />
              <div className="w-36 h-3 bg-indigo-200/30 rounded-md" />
            </div>
            <div className="w-24 h-9 bg-indigo-200/40 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-200/40" />
              <div className="space-y-1.5 flex-1">
                <div className="w-12 h-2.5 bg-indigo-200/30 rounded-md" />
                <div className="w-8 h-5 bg-indigo-200/50 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-200/40" />
              <div className="space-y-1.5 flex-1">
                <div className="w-12 h-2.5 bg-indigo-200/30 rounded-md" />
                <div className="w-8 h-5 bg-indigo-200/50 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Warga Diperiksa skeleton */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/50 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-32 h-5 bg-slate-100 rounded-md" />
            <div className="w-16 h-6 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-32 bg-slate-50/70 rounded-xl" />
          <div className="h-4 bg-slate-100 rounded-full" />
        </div>

        {/* TradingView widgets skeletons */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3.5 h-28 rounded-2xl border border-slate-100/50 shadow-sm" />
          <div className="bg-white p-3.5 h-28 rounded-2xl border border-slate-100/50 shadow-sm" />
        </div>
      </div>
    );
  }

  // Calculate SVG chart parameters for main monthly trend
  const maxVal = Math.max(10, ...stats.tren_bulanan.map((t) => t.jumlah));
  const chartHeight = 160;
  const chartWidth = 320;
  const barWidth = 36;
  const gap = 20;

  return (
    <div className="flex-1 flex flex-col p-4 xs:p-6 max-w-md mx-auto space-y-6 pb-12">
      {/* Hero Section Card (Primary Theme) */}
      <div className="bg-indigo-600 text-white rounded-[2.25rem] p-5 xs:p-6 shadow-md flex flex-col space-y-6">
        {/* Header inside Hero */}
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5">
            <h1 className="text-xl xs:text-2xl font-black tracking-tight text-white">
              Beranda
            </h1>
            <p className="text-[10px] xs:text-xs text-indigo-200/90 font-medium">
              Ringkasan data posyandu
            </p>
          </div>
          {isAdmin && (
            <button
              className="flex items-center justify-start text-left gap-2 pl-3.5 pr-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 rounded-xl text-xs font-black shadow-sm transition-all hover:shadow-md cursor-pointer"
              onClick={handleExport}
              type="button"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="text-left leading-tight">Ekspor Data</span>
            </button>
          )}
        </div>

        {/* Stats Grid inside Hero (Simplified - Flat) */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-indigo-200/90 font-bold uppercase tracking-wider">
                Total Anak
              </span>
              <span className="text-xl font-black text-white mt-0.5">
                {stats.total_peserta}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] text-indigo-200/90 font-bold uppercase tracking-wider">
                Pemeriksaan
              </span>
              <span className="text-xl font-black text-white mt-0.5">
                {stats.total_pemeriksaan}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warga Sudah & Belum Diperiksa Bulan Ini */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100/50 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <button
              className="p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-black text-slate-800 tracking-tight">
              {formatMonthLabel(currentMonth)}
            </h2>
            <button
              className={`p-1 rounded-lg transition-colors text-slate-400 ${
                isNextDisabled
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-slate-50 cursor-pointer hover:text-slate-700"
              }`}
              disabled={isNextDisabled}
              onClick={handleNextMonth}
              title={
                isNextDisabled
                  ? "Tidak bisa melihat masa depan"
                  : "Bulan Selanjutnya"
              }
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
            <button
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                activeMetric === "berat"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => setActiveMetric("berat")}
              type="button"
            >
              Berat
            </button>
            <button
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                activeMetric === "tinggi"
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => setActiveMetric("tinggi")}
              type="button"
            >
              Tinggi
            </button>
          </div>
        </div>

        {(() => {
          const total = stats.total_peserta || 1;
          const sudah = stats.sudah_periksa_bulan_ini;
          const belum = stats.belum_periksa_bulan_ini;
          const persenSudah = (sudah / total) * 100;

          return (
            <div className="space-y-4">
              {/* Sebaran Pengukuran Bulan Ini (Switchable Chart) */}
              {stats.pemeriksaan_bulan_ini &&
              stats.pemeriksaan_bulan_ini.length > 0 ? (
                <SebaranBulanIniChart
                  data={stats.pemeriksaan_bulan_ini}
                  metric={activeMetric}
                />
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Tidak ada data pemeriksaan pada bulan ini.
                </div>
              )}

              {/* Stacked Progress Bar (Thicker) */}
              <div className="relative w-full h-5 rounded-full bg-orange-400 flex shadow-inner overflow-hidden">
                <div
                  className="relative bg-green-500 h-full transition-all duration-500 ease-out flex items-center justify-end pr-[2px] rounded-full"
                  style={{ width: `${persenSudah}%` }}
                  title={`Sudah Diperiksa: ${Math.round(persenSudah)}%`}
                >
                  {/* Floating percentage badge inside the green bar on the far right */}
                  {persenSudah > 12 && (
                    <span className="bg-white text-[8px] font-black text-green-600 px-1.5 py-0.5 rounded-full shadow-sm select-none pointer-events-none">
                      {Math.round(persenSudah)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Narrative Sentence (Below the Bar) */}
              <div className="text-left text-[10.5px] text-slate-500 font-medium leading-relaxed pt-1">
                Pada bulan{" "}
                <span className="text-slate-800 font-bold">
                  {formatMonthLabel(currentMonth)}
                </span>
                , sudah diperiksa{" "}
                <span className="text-green-600 font-bold">{sudah} anak</span>{" "}
                dan belum diperiksa{" "}
                <span className="text-orange-500 font-bold">{belum} anak</span>.
              </div>
            </div>
          );
        })()}
      </div>

      {/* Rata-Rata Pertumbuhan Gaya TradingView */}
      {stats?.rata_rata_pertumbuhan &&
        stats.rata_rata_pertumbuhan.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <TradingViewLineChart
              color="rgb(37, 99, 235)"
              data={stats.rata_rata_pertumbuhan}
              dataKey="rata_berat"
              title="Rata-rata Berat"
              unit="kg"
            />
            <TradingViewLineChart
              color="rgb(217, 119, 6)"
              data={stats.rata_rata_pertumbuhan}
              dataKey="rata_tinggi"
              title="Rata-rata Tinggi"
              unit="cm"
            />
          </div>
        )}

      {/* Grafik Tren Pemeriksaan */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100/50 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Tren Pemeriksaan Bulanan
        </h2>

        {stats?.tren_bulanan && stats.tren_bulanan.length > 0 ? (
          <div className="flex justify-center items-end pt-4">
            <svg
              className="overflow-visible w-full h-auto max-w-[320px]"
              height="100%"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              width="100%"
            >
              <title>Tren Pemeriksaan</title>
              {stats.tren_bulanan.map((item, idx) => {
                const barHeight = (item.jumlah / maxVal) * 120; // scale to max 120px
                const x = 30 + idx * (barWidth + gap);
                const y = chartHeight - 30 - barHeight;

                return (
                  <g key={item.bulan}>
                    {/* Bar */}
                    <rect
                      className="fill-indigo-600 hover:fill-indigo-700 transition-colors"
                      height={barHeight}
                      rx={6}
                      width={barWidth}
                      x={x}
                      y={y}
                    />

                    {/* Value Badge */}
                    <text
                      className="text-[10px] font-bold fill-slate-700 font-sans"
                      textAnchor="middle"
                      x={x + barWidth / 2}
                      y={y - 8}
                    >
                      {item.jumlah}
                    </text>

                    {/* Label Bulan */}
                    <text
                      className="text-[10px] font-semibold fill-slate-400 font-sans"
                      textAnchor="middle"
                      x={x + barWidth / 2}
                      y={chartHeight - 10}
                    >
                      {item.bulan}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            Belum ada riwayat pengukuran untuk ditampilkan pada grafik.
          </div>
        )}
      </div>
    </div>
  );
}
