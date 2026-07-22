import React from 'react';
import { ArrowLeft, Radio } from 'lucide-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/anggota/input/')({
  component: MeasurementForm,
});

function MeasurementForm() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md md:max-w-4xl mx-auto flex flex-col relative md:bg-white md:rounded-[2rem] md:shadow-xl md:overflow-hidden md:min-h-[auto]">
        
        <div className="p-4 md:px-8 md:pt-8 md:pb-4 flex items-center md:border-b md:border-slate-100">
          <Link to="/anggota/" className="p-2 -ml-2 text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="hidden md:block ml-2 text-lg font-bold text-slate-800">
            Input Data Pengukuran
          </h1>
        </div>

        <div className="px-5 pb-8 flex-1 overflow-y-auto md:p-8 md:overflow-visible">
          
        
          <div className="md:grid md:grid-cols-2 md:gap-10 lg:gap-14">
            
            <div className="flex flex-col">
              
              <div className="relative bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 mb-8 overflow-hidden md:border-slate-200 md:shadow-md">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-orange-300 rounded-r-full" />
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 ml-1">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" 
                    alt="Budi Santoso" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-[16px]">Budi Santoso</span>
                  <span className="text-sm text-slate-500 mt-0.5">24 Bulan • Laki-laki</span>
                </div>
              </div>

              <div className="mb-6 md:mb-0">
                <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-3 uppercase">
                  Sensor Otomatis
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 md:border-slate-200 md:shadow-md md:py-6">
                    <span className="text-xs text-slate-500 mb-2">Berat Badan (kg)</span>
                    <span className="text-2xl font-bold text-slate-800">--</span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 md:border-slate-200 md:shadow-md md:py-6">
                    <span className="text-xs text-slate-500 mb-2">Tinggi Badan (cm)</span>
                    <span className="text-2xl font-bold text-slate-800">--</span>
                  </div>
                </div>
                <button className="w-full py-3.5 md:py-4 rounded-full border-2 border-indigo-200 text-indigo-700 font-semibold flex justify-center items-center gap-2 hover:bg-indigo-50 transition-colors">
                  <Radio className="w-5 h-5" />
                  <span>Ukur BB & TB (Sensor)</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-200 my-6 md:hidden" />

            <div className="flex flex-col space-y-4 h-full">
              
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
                      placeholder="Contoh: 45.5" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Lingkar Lengan (cm)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Contoh: 14.5" 
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-4">
                  <label className="text-xs font-semibold text-slate-700">Pemberian ASI</label>
                  <select className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm appearance-none">
                    <option value="eksklusif">Eksklusif</option>
                    <option value="parsial">Parsial</option>
                    <option value="tidak">Tidak Diberikan</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input 
                    type="checkbox" 
                    id="edema"
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                  />
                  <label htmlFor="edema" className="text-sm text-slate-700 font-medium cursor-pointer">
                    Pitting Edema
                  </label>
                </div>
              </div>

              
              <div className="mt-10 md:mt-auto pt-4 md:pt-8">
                <button className="w-full py-4 rounded-full bg-[#373895] text-white font-semibold hover:bg-indigo-800 transition-colors shadow-md">
                  Simpan Data Pengukuran
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}