import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Search, 
  ScanLine, 
  UserPlus, 
  Ruler, 
  Home, 
  Users, 
  User 
} from 'lucide-react';

export const Route = createFileRoute("/anggota/")({
  component: MobileView,
});

function MobileView() {
  const childrenData = [
    {
      initials: 'AP',
      name: 'Aditya Pratama',
      age: '2 Tahun 4 Bulan',
      isActive: true, 
    },
    {
      initials: 'BS',
      name: 'Bunga Saraswati',
      age: '1 Tahun 8 Bulan',
      isActive: false,
    },
    {
      initials: 'CA',
      name: 'Candra Atmadja',
      age: '9 Bulan',
      isActive: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] max-w-md mx-auto relative font-sans text-slate-800 border-x">
      <div className="flex items-center gap-3 p-4 pt-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama anak..."
            className="w-full pl-10 pr-12 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white shadow-sm text-sm"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors">
            <ScanLine className="w-5 h-5" />
          </button>
        </div>
        <Link to="/anggota/input/" className="p-2 -ml-2 text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors">
        <button className="p-3 border border-slate-200 rounded-2xl bg-white text-indigo-700 hover:bg-slate-50 transition-colors shadow-sm flex-shrink-0">
          <UserPlus className="w-5 h-5" />
        </button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
        {childrenData.map((child, index) => (
          <div 
            key={index}
            className="relative bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100/50 overflow-hidden"
          >
            {child.isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-orange-300 rounded-r-full" />
            )}

            <div className="flex items-center gap-4 pl-1">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-sm shrink-0">
                {child.initials}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-[15px]">
                  {child.name}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {child.age}
                </span>
              </div>
            </div>

            <button className="text-indigo-800 p-2">
              <Ruler className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-200 flex justify-around pb-6 pt-3 px-2 z-10 rounded-t-xl">
        <Link 
          to="/" 
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-20 [&.active]:text-indigo-700"
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        
        <Link 
          to="/anggota" 
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-20 [&.active]:text-indigo-700"
        >
          <Users className="w-6 h-6" /> 
          <span className="text-[10px] font-medium">Anggota</span>
        </Link>
        
        <Link 
          to="/akun" 
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-20 [&.active]:text-indigo-700"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Akun</span>
        </Link>
      </div>
    </div>
  );
}