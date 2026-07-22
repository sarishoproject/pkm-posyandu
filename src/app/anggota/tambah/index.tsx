import React from 'react';
import { X } from 'lucide-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/anggota/tambah/')({
  component: AddMemberForm,
});

function AddMemberForm() {
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
          <form className="space-y-5 flex-1 flex flex-col">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Nama Anak</label>
              <input 
                type="text" 
                placeholder="Masukkan nama lengkap anak" 
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">NIK (Nomor Induk Kependudukan)</label>
              <input 
                type="text" 
                maxLength={16}
                placeholder="16 digit NIK" 
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Jenis Kelamin</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-indigo-400 bg-indigo-50 text-indigo-700 font-medium text-sm transition-colors"
                >
                  <span className="text-lg leading-none">♂</span> Laki-laki
                </button>
                
                <button 
                  type="button"
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="text-lg leading-none">♀</span> Perempuan
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Tanggal Lahir Anak</label>
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
                <select className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white text-sm appearance-none cursor-pointer">
                  <option value="">Tgl</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>

                <select className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white text-sm appearance-none cursor-pointer">
                  <option value="">Bulan</option>
                  <option value="1">Januari</option>
                  <option value="2">Februari</option>
                  <option value="3">Maret</option>
                </select>

                <input 
                  type="number" 
                  placeholder="Tahun" 
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Nama Ibu Kandung</label>
              <input 
                type="text" 
                placeholder="Masukkan nama ibu" 
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
              />
            </div>

            <div className="mt-auto pt-8">
              <button 
                type="submit"
                className="w-full py-4 rounded-xl bg-[#23257B] text-white font-medium text-sm hover:bg-[#1a1c5e] transition-colors"
              >
                Simpan Data
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}