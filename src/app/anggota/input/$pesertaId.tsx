import React, { useState } from 'react';
import { ArrowLeft, Radio, Loader2 } from 'lucide-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';

// Mendefinisikan route dinamis berdasarkan nama file $pesertaId.tsx
export const Route = createFileRoute('/anggota/input/$pesertaId')({
  component: MeasurementForm,
});

function MeasurementForm() {
  const navigate = useNavigate();
  
  // Mengambil ID dari URL (misal: /anggota/input/1 -> pesertaId = "1")
  const { pesertaId } = Route.useParams(); 

  const [isLoading, setIsLoading] = useState(false);
  const [isSensorLoading, setIsSensorLoading] = useState(false);
  
  // State form sesuai dengan interface PendataanInput di backend
  const [formData, setFormData] = useState({
    peserta_id: Number(pesertaId),
    tanggal_ukur: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    berat: '',
    tinggi: '',
    lingkar_kepala: '',
    lila: '', // Lingkar Lengan Atas
    pitting_edema: false, // Boolean di UI
    cara_ukur: 'Berdiri', 
  });

  // Fungsi untuk mengambil data dari Mock API Sensor
  const handleSimulateSensor = async () => {
    setIsSensorLoading(true);
    
    try {
      // Menjalankan fetch secara paralel agar lebih cepat
      const [weightRes, heightRes] = await Promise.all([
        fetch('https://mock.fadlanabduh.my.id/api/weight'),
        fetch('https://mock.fadlanabduh.my.id/api/height')
      ]);

      if (!weightRes.ok || !heightRes.ok) {
        throw new Error('Gagal terhubung ke sensor alat ukur.');
      }

      const weightData = await weightRes.json();
      const heightData = await heightRes.json();

      // Ekstraksi nilai (menyesuaikan kemungkinan struktur JSON dari API)
      const hasilBerat = weightData.weight ?? weightData.value ?? weightData;
      const hasilTinggi = heightData.height ?? heightData.value ?? heightData;

      // Update state dengan data dari sensor
      setFormData(prev => ({
        ...prev,
        berat: Number(hasilBerat).toFixed(1),
        tinggi: Number(hasilTinggi).toFixed(1)
      }));

    } catch (error: any) {
      console.error("Error membaca sensor:", error);
      alert(error.message || 'Gagal mengambil data dari sensor otomatis.');
    } finally {
      setIsSensorLoading(false);
    }
  };

  // Fungsi untuk mengirim data ke backend Hono
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Konversi tipe data agar sesuai dengan skema database
      const payload = {
        ...formData,
        berat: formData.berat ? Number(formData.berat) : null,
        tinggi: formData.tinggi ? Number(formData.tinggi) : null,
        lingkar_kepala: formData.lingkar_kepala ? Number(formData.lingkar_kepala) : null,
        lila: formData.lila ? Number(formData.lila) : null,
        pitting_edema: formData.pitting_edema ? "Ya" : "Tidak",
      };

      const response = await fetch('/api/pendataan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menyimpan data');
      }

      alert('Data pengukuran berhasil disimpan!');
      // Arahkan kembali ke halaman info/detail anggota
      navigate({ to: `/anggota/info/${pesertaId}` as any });

    } catch (error: any) {
      console.error("Error submit data:", error);
      alert(error.message || 'Terjadi kesalahan pada sistem saat menyimpan data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md md:max-w-4xl mx-auto flex flex-col relative md:bg-white md:rounded-[2rem] md:shadow-xl md:overflow-hidden md:min-h-[auto]">
        
        {/* Header */}
        <div className="p-4 md:px-8 md:pt-8 md:pb-4 flex items-center md:border-b md:border-slate-100">
          <Link to="/anggota/" className="p-2 -ml-2 text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="hidden md:block ml-2 text-lg font-bold text-slate-800">
            Input Data Pengukuran
          </h1>
        </div>

        <div className="px-5 pb-8 flex-1 overflow-y-auto md:p-8 md:overflow-visible">
          
          <form onSubmit={handleSubmit} className="md:grid md:grid-cols-2 md:gap-10 lg:gap-14 h-full flex flex-col">
            
            {/* ================= KOLOM KIRI (Profil & Sensor) ================= */}
            <div className="flex flex-col">
              
              {/* Card Profil Anak (Bisa di-fetch dari API nantinya, sementara statis) */}
              <div className="relative bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 mb-8 overflow-hidden md:border-slate-200 md:shadow-md">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-orange-300 rounded-r-full" />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 ml-1">
                  ID: {pesertaId}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-[16px]">Data Peserta</span>
                  <span className="text-sm text-slate-500 mt-0.5">Input pengukuran baru</span>
                </div>
              </div>

              {/* Area Sensor */}
              <div className="mb-6 md:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    Sensor Otomatis
                  </h3>
                  <span className="text-[10px] font-medium text-slate-400">
                    Tgl: {formData.tanggal_ukur}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 md:border-slate-200 md:shadow-md md:py-6 relative">
                    <span className="text-xs text-slate-500 mb-2 text-center">Berat Badan (kg)</span>
                    <span className={`text-2xl font-bold ${formData.berat ? 'text-indigo-600' : 'text-slate-800'}`}>
                      {formData.berat || '--'}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 md:border-slate-200 md:shadow-md md:py-6 relative">
                    <span className="text-xs text-slate-500 mb-2 text-center">Tinggi Badan (cm)</span>
                    <span className={`text-2xl font-bold ${formData.tinggi ? 'text-orange-500' : 'text-slate-800'}`}>
                      {formData.tinggi || '--'}
                    </span>
                  </div>
                </div>
                
                {/* Tombol Fetch API Sensor */}
                <button 
                  type="button"
                  onClick={handleSimulateSensor}
                  disabled={isSensorLoading}
                  className="w-full py-3.5 md:py-4 rounded-full border-2 border-indigo-200 text-indigo-700 font-semibold flex justify-center items-center gap-2 hover:bg-indigo-50 transition-colors disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                >
                  {isSensorLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Membaca Sensor...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-5 h-5" />
                      <span>{formData.berat ? 'Ukur Ulang (Sensor)' : 'Ukur BB & TB (Sensor)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <hr className="border-slate-200 my-6 md:hidden" />

            {/* ================= KOLOM KANAN (Input Manual) ================= */}
            <div className="flex flex-col space-y-4 h-full flex-1">
              
              <div className="flex-1">
                <h3 className="hidden md:block text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">
                  Input Manual & Data Tambahan
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Lingkar Kepala (cm)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={formData.lingkar_kepala}
                      onChange={(e) => setFormData({...formData, lingkar_kepala: e.target.value})}
                      placeholder="Contoh: 45.5" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Lingkar Lengan (cm)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={formData.lila}
                      onChange={(e) => setFormData({...formData, lila: e.target.value})}
                      placeholder="Contoh: 14.5" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-4">
                  <label className="text-xs font-semibold text-slate-700">Cara Ukur Tinggi</label>
                  <select 
                    value={formData.cara_ukur}
                    onChange={(e) => setFormData({...formData, cara_ukur: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm appearance-none cursor-pointer"
                  >
                    <option value="Berdiri">Berdiri</option>
                    <option value="Terlentang">Terlentang</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input 
                    type="checkbox" 
                    id="edema"
                    checked={formData.pitting_edema}
                    onChange={(e) => setFormData({...formData, pitting_edema: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                  />
                  <label htmlFor="edema" className="text-sm text-slate-700 font-medium cursor-pointer">
                    Pitting Edema
                  </label>
                </div>
              </div>

              {/* Tombol Submit Hono */}
              <div className="mt-10 md:mt-auto pt-4 md:pt-8">
                <button 
                  type="submit" 
                  disabled={isLoading || (!formData.berat && !formData.tinggi)} // Disable jika belum ukur
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#373895] text-white font-semibold hover:bg-indigo-800 transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan Data...
                    </>
                  ) : (
                    'Simpan Data Pengukuran'
                  )}
                </button>
              </div>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
}