import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/anggota/tambah/$pesertaId')({
  component: AddMemberForm,
});

function AddMemberForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // State disesuaikan dengan kebutuhan Form UI dan Backend
  const [formData, setFormData] = useState({
    nama_anak: '',
    nik: '',
    nama_ibu: '',
    // Data berikut hanya untuk UI saat ini karena belum ada di interface backend
    jenis_kelamin: 'Laki-laki',
    tgl_lahir: '',
    bulan_lahir: '',
    tahun_lahir: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Siapkan payload sesuai interface PesertaInput
      const payload = {
        nama_anak: formData.nama_anak,
        nik: formData.nik,
        nama_ibu: formData.nama_ibu,
        status: 'Aktif', // Default status
        // asi_bulan_0 hingga asi_bulan_6 tidak dikirim (opsional di backend)
      };

      // 2. Kirim ke API endpoint yang sudah Anda buat
      const response = await fetch('/api/peserta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data');
      }

      // 3. Berikan feedback dan arahkan kembali
      alert('Data anggota baru berhasil disimpan!');
      navigate({ to: '/anggota/' });
      
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 font-sans md:p-6 lg:p-8 flex items-center justify-center">
      
      <div className="w-full max-w-md mx-auto flex flex-col relative md:bg-white md:rounded-[2rem] md:shadow-xl md:overflow-hidden min-h-screen md:min-h-[auto] md:border md:border-slate-100">
        
        <div className="p-4 md:px-8 md:pt-8 flex items-center gap-3">
          <Link 
            to="/anggota/" 
            className="p-1 -ml-1 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-6 h-6" />
          </Link>
          <h1 className="text-[17px] font-medium text-slate-800">
            Tambah Anggota Baru
          </h1>
        </div>

        <div className="px-5 pt-2 pb-8 flex-1 flex flex-col md:px-8">
          <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Nama Anak</label>
              <input 
                type="text" 
                required
                value={formData.nama_anak}
                onChange={(e) => setFormData({ ...formData, nama_anak: e.target.value })}
                placeholder="Masukkan nama lengkap anak" 
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">NIK (Nomor Induk Kependudukan)</label>
              <input 
                type="text" 
                required
                maxLength={16}
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })} // Hanya angka
                placeholder="16 digit NIK" 
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
              />
            </div>

            {/* JENIS KELAMIN - Hanya untuk UI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Jenis Kelamin</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, jenis_kelamin: 'Laki-laki' })}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-medium text-sm transition-colors ${
                    formData.jenis_kelamin === 'Laki-laki' 
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg leading-none">♂</span> Laki-laki
                </button>
                
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, jenis_kelamin: 'Perempuan' })}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-medium text-sm transition-colors ${
                    formData.jenis_kelamin === 'Perempuan' 
                      ? 'border-pink-400 bg-pink-50 text-pink-700' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg leading-none">♀</span> Perempuan
                </button>
              </div>
            </div>

            {/* TANGGAL LAHIR - Hanya untuk UI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Tanggal Lahir Anak</label>
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
                <select 
                  value={formData.tgl_lahir}
                  onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white text-sm appearance-none cursor-pointer"
                >
                  <option value="">Tgl</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>

                <select 
                  value={formData.bulan_lahir}
                  onChange={(e) => setFormData({ ...formData, bulan_lahir: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white text-sm appearance-none cursor-pointer"
                >
                  <option value="">Bulan</option>
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                  <option value="4">April</option>
                  <option value="5">Mei</option>
                  <option value="6">Juni</option>
                  <option value="7">Juli</option>
                  <option value="8">Agustus</option>
                  <option value="9">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>

                <input 
                  type="number" 
                  value={formData.tahun_lahir}
                  onChange={(e) => setFormData({ ...formData, tahun_lahir: e.target.value })}
                  placeholder="Tahun" 
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Nama Ibu Kandung</label>
              <input 
                type="text"
                value={formData.nama_ibu}
                onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })}
                placeholder="Masukkan nama ibu" 
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
              />
            </div>

            <div className="mt-auto pt-8">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-[#23257B] text-white font-medium text-sm hover:bg-[#1a1c5e] transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}