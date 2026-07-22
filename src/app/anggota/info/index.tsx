import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  Plus, 
  Calendar 
} from 'lucide-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/anggota/info/')({
  component: MemberDetailView,
});

function MemberDetailView() {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // 2. Data titik koordinat dan nilai grafik
  // x = posisi horizontal (kiri-kanan) | y = posisi vertikal (atas-bawah)
  const graphData = [
    { id: 1, date: 'Okt', x: 40, weight: 11.2, weightY: 145, height: 81, heightY: 120 },
    { id: 2, date: 'Nov', x: 120, weight: 11.8, weightY: 125, height: 83, heightY: 100 },
    { id: 3, date: 'Des', x: 200, weight: 12.2, weightY: 105, height: 84, heightY: 90 },
    { id: 4, date: 'Jan', x: 280, weight: 12.5, weightY: 95, height: 85, heightY: 70 },
    { id: 5, date: 'Feb', x: 360, weight: 12.8, weightY: 75, height: 86.5, heightY: 30 },
  ];

  const weightPath = `M ${graphData.map(d => `${d.x} ${d.weightY}`).join(' L ')}`;
  const heightPath = `M ${graphData.map(d => `${d.x} ${d.heightY}`).join(' L ')}`;

  const historyData = [
    { id: 1, date: '12 Jan 2024', age: '24 Bulan', weight: '12.5 kg', height: '85 cm', isLatest: true },
    { id: 2, date: '10 Des 2023', age: '23 Bulan', weight: '12.2 kg', height: '84 cm', isLatest: false },
    { id: 3, date: '15 Nov 2023', age: '22 Bulan', weight: '11.8 kg', height: '83 cm', isLatest: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md md:max-w-5xl mx-auto flex flex-col relative md:bg-white md:rounded-[2rem] md:shadow-xl md:overflow-hidden min-h-screen md:min-h-[auto] md:border md:border-slate-100">
        
        <div className="p-4 md:px-8 md:pt-8 flex items-center md:border-b md:border-slate-100">
          <Link to="/" className="p-2 -ml-2 text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="hidden md:block ml-2 text-lg font-bold text-slate-800">
            Detail Anggota
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-8 md:p-8">
          <div className="md:grid md:grid-cols-2 md:gap-12">
            
            <div className="flex flex-col px-5 md:px-0">
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-[#E0E7FF] text-[#1E1B4B] flex items-center justify-center font-bold text-3xl shrink-0">
                  AP
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-slate-900 text-lg leading-tight truncate">
                      Aditya Pratama
                    </h2>
                    <button className="flex items-center gap-1.5 text-slate-600 hover:text-[#1E1B4B] transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm shrink-0">
                      <Pencil className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Edit</span>
                    </button>
                  </div>
                  <div className="flex flex-col mt-2 space-y-0.5">
                    <span className="text-xs text-slate-500">NIK: 3275010987654321</span>
                    <span className="text-xs text-slate-500">Tgl Lahir: 12 Jan 2022</span>
                    <span className="text-xs text-slate-500">2 Tahun 4 Bulan • Laki-laki</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-800 text-[15px]">Grafik Pertumbuhan</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ketuk titik pada grafik untuk melihat detail angka.</p>
                </div>

                <div className="bg-[#F8F9FA] rounded-2xl p-4 md:border md:border-slate-100 md:shadow-sm">
                  
                  <div className="relative w-full">
                    <svg viewBox="0 0 400 200" className="w-full h-auto overflow-visible" preserveAspectRatio="none">
                      
                      <line x1="0" y1="40" x2="400" y2="40" stroke="#E2E8F0" strokeWidth="1.5" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#E2E8F0" strokeWidth="1.5" />
                      <line x1="0" y1="160" x2="400" y2="160" stroke="#E2E8F0" strokeWidth="1.5" />

                      <path d={heightPath} fill="none" stroke="#FDBA74" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d={weightPath} fill="none" stroke="#1E1B4B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                      {graphData.map((d) => {
                        const isSelected = selectedPoint?.id === d.id;
                        return (
                          <g key={d.id}>
                            {isSelected && (
                              <line x1={d.x} y1="20" x2={d.x} y2="160" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
                            )}

                            <circle cx={d.x} cy={d.heightY} r={isSelected ? "5" : "3.5"} fill={isSelected ? "#FFF" : "#FDBA74"} stroke="#FDBA74" strokeWidth={isSelected ? "2" : "0"} />
                            
                            <circle cx={d.x} cy={d.weightY} r={isSelected ? "5" : "3.5"} fill={isSelected ? "#FFF" : "#1E1B4B"} stroke="#1E1B4B" strokeWidth={isSelected ? "2" : "0"} />

                            <text x={d.x} y="185" fontSize="11" fill={isSelected ? "#1E1B4B" : "#64748B"} textAnchor="middle" fontWeight={isSelected ? "700" : "500"}>
                              {d.date}
                            </text>

                            <rect 
                              x={d.x - 20} y="0" width="40" height="200" 
                              fill="transparent" 
                              className="cursor-pointer" 
                              onClick={() => setSelectedPoint(isSelected ? null : d)} // Klik lagi untuk menutup
                            />
                          </g>
                        )
                      })}
                    </svg>

                    {selectedPoint && (
                      <div
                        className="absolute bg-white shadow-lg border border-slate-100 rounded-xl p-2.5 flex flex-col gap-1 w-28 pointer-events-none transition-all duration-200 z-10"
                        style={{
                          left: `${(selectedPoint.x / 400) * 100}%`,
                          top: `${(Math.min(selectedPoint.heightY, selectedPoint.weightY) / 200) * 100}%`,
                          transform: 'translate(-50%, -115%)'
                        }}
                      >
                        <span className="text-[11px] font-bold text-slate-800 text-center mb-0.5 border-b border-slate-100 pb-1">
                          {selectedPoint.date} 2024
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
                  <span className="text-lg font-bold text-slate-800">12.5 kg</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 mb-1">Tinggi Badan (Terakhir)</span>
                  <span className="text-lg font-bold text-slate-800">85 cm</span>
                </div>
              </div>

            </div>

            <div className="w-full h-2 bg-slate-100 md:hidden mb-6"></div>

            <div className="flex flex-col px-5 md:px-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-800 text-[15px]">Riwayat Pengukuran</h3>
                <Link 
                  to="/anggota/tambah" 
                  className="flex items-center gap-1 bg-[#1E1B4B] text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah
                </Link>
              </div>

              <div className="space-y-4">
                {historyData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white md:bg-slate-50 md:border md:border-slate-100 p-3 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.isLatest ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{item.date}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5">Usia: {item.age}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-800">{item.weight}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">{item.height}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}