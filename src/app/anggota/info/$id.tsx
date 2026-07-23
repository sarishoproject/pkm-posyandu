import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  Plus, 
  Calendar,
  Loader2
} from 'lucide-react';
import { Link, createFileRoute } from '@tanstack/react-router';

// Route dinamis TanStack
export const Route = createFileRoute('/anggota/info/$id')({
  component: MemberDetailView,
});

// Interface response dari Backend
interface DetailResponse {
  id: number;
  nama_anak: string;
  nik: string;
  nama_ibu: string | null;
  status: string;
  tanggal_lahir?: string; 
  jenis_kelamin?: string; 
  riwayat: {
    id: number;
    tanggal_ukur: string;
    berat: number | null;
    tinggi: number | null;
  }[];
}

function MemberDetailView() {
  const { id } = Route.useParams(); 
  
  const [data, setData] = useState<DetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Fetch data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/peserta/${id}`);
        if (!response.ok) throw new Error('Data tidak ditemukan');
        
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching detail:', error);
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

  // --- LOGIKA GRAFIK DINAMIS ---
  const riwayatUrut = [...data.riwayat].reverse();

  const graphData = riwayatUrut.map((item, index) => {
    const spacingX = riwayatUrut.length > 1 ? 360 / (riwayatUrut.length - 1) : 180;
    const x = 20 + (index * spacingX);
    
    // Kalkulasi Y (vertikal)
    const berat = item.berat || 0;
    let weightY = 160 - (berat * 5); 

    const tinggi = item.tinggi || 0;
    let heightY = 160 - ((tinggi - 40) * 1.5); 

    // PENYELESAIAN BUG 1: Kunci batas Y (Clamp) agar tidak tembus ke atas/bawah jika datanya ekstrem
    weightY = Math.max(15, Math.min(185, weightY));
    heightY = Math.max(15, Math.min(185, heightY));

    const dateObj = new Date(item.tanggal_ukur);
    const shortBulan = dateObj.toLocaleDateString('id-ID', { month: 'short' }); 
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

  const weightPath = `M ${graphData.map(d => `${d.x} ${d.weightY}`).join(' L ')}`;
  const heightPath = `M ${graphData.map(d => `${d.x} ${d.heightY}`).join(' L ')}`;

  const dataTerbaru = data.riwayat[0];
  const inisial = data.nama_anak.substring(0, 2).toUpperCase();

  // --- FUNGSI HELPER UI ---
  const formatTanggalLahir = (tgl?: string) => {
    if (!tgl) return '-';
    return new Date(tgl).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const hitungUmur = (tglLahir?: string) => {
    if (!tglLahir) return '-';
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md md:max-w-5xl mx-auto flex flex-col relative md:bg-white md:rounded-[2rem] md:shadow-xl md:overflow-hidden min-h-screen md:min-h-[auto] md:border md:border-slate-100">
        
        {/* Header */}
        <div className="p-4 md:px-8 md:pt-8 flex items-center md:border-b md:border-slate-100">
          <Link to="/anggota" className="p-2 -ml-2 text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="hidden md:block ml-2 text-lg font-bold text-slate-800">
            Detail Anggota
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-8 md:p-8">
          <div className="md:grid md:grid-cols-2 md:gap-12">
            
            {/* KOLOM KIRI (Profil & Grafik) */}
            <div className="flex flex-col px-5 md:px-0">
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-[#E0E7FF] text-[#1E1B4B] flex items-center justify-center font-bold text-3xl shrink-0">
                  {inisial}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-slate-900 text-lg leading-tight truncate">
                      {data.nama_anak}
                    </h2>
                    <Link 
                      to={`/anggota/edit/${id}`}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-[#1E1B4B] transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm shrink-0"
                    >
                      <Pencil className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Edit</span>
                    </Link>
                  </div>
                  <div className="flex flex-col mt-2 space-y-0.5">
                    <span className="text-xs text-slate-500">NIK: {data.nik}</span>
                    <span className="text-xs text-slate-500">Tgl Lahir: {formatTanggalLahir(data.tanggal_lahir)}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {hitungUmur(data.tanggal_lahir)} • {data.jenis_kelamin || 'Laki-laki'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-800 text-[15px]">Grafik Pertumbuhan</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ketuk area titik pada grafik untuk melihat detail angka.</p>
                </div>

                <div className="bg-[#F8F9FA] rounded-2xl p-4 md:border md:border-slate-100 md:shadow-sm">
                  
                  {graphData.length > 0 ? (
                    // PENYELESAIAN BUG 2: Gunakan h-[220px] yang konstan, alih-alih aspect-ratio. 
                    // Ini memastikan kotak container grafik selalu punya dimensi fisik yang kuat.
                    <div className="relative w-full h-[220px]">
                      <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        
                        <line x1="0" y1="40" x2="400" y2="40" stroke="#E2E8F0" strokeWidth="1.5" />
                        <line x1="0" y1="100" x2="400" y2="100" stroke="#E2E8F0" strokeWidth="1.5" />
                        <line x1="0" y1="160" x2="400" y2="160" stroke="#E2E8F0" strokeWidth="1.5" />

                        <path d={heightPath} fill="none" stroke="#FDBA74" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={weightPath} fill="none" stroke="#1E1B4B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                        {graphData.map((d) => {
                          const isSelected = selectedPoint?.id === d.id;
                          return (
                            <g 
                              key={d.id} 
                              className="cursor-pointer outline-none" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPoint(isSelected ? null : d);
                              }}
                            >
                              {/* Invisible hitbox dengan fill="transparent" (bukan rgba) supaya kompatibel */}
                              <rect x={d.x - 20} y="0" width="40" height="200" fill="transparent" />

                              {isSelected && (
                                <line x1={d.x} y1="20" x2={d.x} y2="160" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
                              )}

                              <circle cx={d.x} cy={d.heightY} r={isSelected ? "5" : "3.5"} fill={isSelected ? "#FFF" : "#FDBA74"} stroke="#FDBA74" strokeWidth={isSelected ? "2" : "0"} />
                              <circle cx={d.x} cy={d.weightY} r={isSelected ? "5" : "3.5"} fill={isSelected ? "#FFF" : "#1E1B4B"} stroke="#1E1B4B" strokeWidth={isSelected ? "2" : "0"} />

                              <text x={d.x} y="185" fontSize="11" fill={isSelected ? "#1E1B4B" : "#64748B"} textAnchor="middle" fontWeight={isSelected ? "700" : "500"}>
                                {d.date}
                              </text>
                            </g>
                          )
                        })}
                      </svg>

                      {/* Tooltip Popup */}
                      {selectedPoint && (
                        <div
                          className="absolute bg-white shadow-lg border border-slate-100 rounded-xl p-2.5 flex flex-col gap-1 w-28 pointer-events-none transition-all duration-200 z-20"
                          style={{
                            left: `${(selectedPoint.x / 400) * 100}%`,
                            top: `${(Math.min(selectedPoint.heightY, selectedPoint.weightY) / 200) * 100}%`,
                            transform: 'translate(-50%, -115%)'
                          }}
                        >
                          <span className="text-[11px] font-bold text-slate-800 text-center mb-0.5 border-b border-slate-100 pb-1">
                            {selectedPoint.fullDate}
                          </span>
                          <div className="flex items-center justify-between text-[11px] mt-0.5">
                            <span className="text-slate-500">Berat</span>
                            <span className="font-bold text-[#1E1B4B]">{selectedPoint.weight} kg</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Tinggi</span>
                            <span className="font-bold text-[#FDBA74]">{selectedPoint.height} cm</span>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="py-12 flex items-center justify-center">
                      <span className="text-sm text-slate-400">Belum ada data grafik.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#1E1B4B]"></div>
                      <span className="text-[10px] text-slate-500 font-medium">Berat Badan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#FDBA74]"></div>
                      <span className="text-[10px] text-slate-500 font-medium">Tinggi Badan</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-b border-slate-200 py-4 mb-8 md:mb-0">
                <div className="flex-1 flex flex-col items-center border-r border-slate-200">
                  <span className="text-[10px] text-slate-500 mb-1">Berat Badan (Terakhir)</span>
                  <span className="text-lg font-bold text-slate-800">
                    {dataTerbaru?.berat ? `${dataTerbaru.berat} kg` : '-'}
                  </span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 mb-1">Tinggi Badan (Terakhir)</span>
                  <span className="text-lg font-bold text-slate-800">
                    {dataTerbaru?.tinggi ? `${dataTerbaru.tinggi} cm` : '-'}
                  </span>
                </div>
              </div>

            </div>

            <div className="w-full h-2 bg-slate-100 md:hidden mb-6"></div>

            {/* KOLOM KANAN (Riwayat Pengukuran) */}
            <div className="flex flex-col px-5 md:px-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-800 text-[15px]">Riwayat Pengukuran</h3>
                <Link 
                  to={`/anggota/input/${id}`}
                  className="flex items-center gap-1 bg-[#1E1B4B] text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah
                </Link>
              </div>

              <div className="space-y-4">
                {data.riwayat.length > 0 ? (
                  data.riwayat.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between bg-white md:bg-slate-50 md:border md:border-slate-100 p-3 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          index === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">
                            {new Date(item.tanggal_ukur).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-800">{item.berat || '-'} kg</span>
                        <span className="text-[11px] text-slate-500 mt-0.5">{item.tinggi || '-'} cm</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    Belum ada riwayat pengukuran.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}