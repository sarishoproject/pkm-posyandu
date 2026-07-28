import { createFileRoute } from "@tanstack/react-router";
import { User, LogIn, LogOut, Key, AlertCircle, Eye, EyeOff, Download, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/akun/")({
  component: AkunPage,
});

interface Peserta {
  id: number;
  nama_anak: string;
  nik: string;
}

function AkunPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Manage Members State
  const [members, setMembers] = useState<Peserta[]>([]);
  const [deleteInputName, setDeleteInputName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  // Fetch members to check name availability when logged in
  useEffect(() => {
    if (isLoggedIn) {
      const fetchMembers = async () => {
        try {
          const res = await fetch("/api/peserta");
          if (res.ok) {
            const data = await res.json();
            setMembers(data);
          }
        } catch (err) {
          console.error("Gagal mengambil daftar anggota:", err);
        }
      };
      fetchMembers();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "Admin#1234") {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      setLoginError("");
      window.dispatchEvent(new Event("auth-change"));
    } else {
      setLoginError("Username atau password salah!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setShowPassword(false);
    window.dispatchEvent(new Event("auth-change"));
  };

  const handleExport = () => {
    window.open("/api/export", "_blank");
  };

  const handleDeleteByName = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError("");
    setDeleteSuccess("");

    const targetName = deleteInputName.trim().toLowerCase();
    const matchedMember = members.find(
      (m) => m.nama_anak.toLowerCase() === targetName
    );

    if (!matchedMember) {
      setDeleteError("Nama lengkap anak tidak ditemukan / tidak cocok. Pastikan ejaan tepat.");
      return;
    }

    const confirmed = await window.showCustomConfirm(`Yakin ingin menghapus anggota "${matchedMember.nama_anak}" beserta seluruh riwayat pengukurannya?`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/peserta/${matchedMember.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== matchedMember.id));
        setDeleteInputName("");
        window.dispatchEvent(new Event("auth-change")); // Refresh stats on home
        await window.showCustomAlert(`Anggota "${matchedMember.nama_anak}" berhasil dihapus.`);
      } else {
        setDeleteError("Gagal menghapus anggota dari server.");
        await window.showCustomAlert("Gagal menghapus anggota.");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Terjadi kesalahan sistem saat memproses penghapusan.");
      await window.showCustomAlert("Terjadi kesalahan saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 max-w-md mx-auto w-full min-h-[85vh] space-y-6 pb-24">
      {isLoggedIn ? (
        /* ================= ADMIN VIEW ================= */
        <div className="w-full space-y-6">
          {/* Profile Header */}
          <div className="w-full bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Admin Posyandu</h2>
              <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                Administrator
              </div>
            </div>
          </div>

          {/* Quick Actions (Export Only) */}
          <div className="w-full bg-white rounded-[2.25rem] p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi Cepat</h3>
            
            {/* Export Data Button */}
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between py-1 hover:opacity-80 transition-all text-left cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Ekspor Laporan Excel</span>
                  <span className="text-[10px] text-slate-400 font-medium">Download data rekap posyandu</span>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Unduh</span>
            </button>
          </div>

          {/* Safe Delete Section */}
          <div className="w-full bg-white rounded-[2.25rem] p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hapus Anggota</h3>
              <p className="text-[10.5px] text-slate-400 leading-relaxed font-medium">
                Untuk mencegah ketidaksengajaan, ketik **Nama Lengkap Anak** secara tepat dan sesuai ejaan.
              </p>
            </div>

            {deleteError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {deleteSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{deleteSuccess}</span>
              </div>
            )}

            <form onSubmit={handleDeleteByName} className="space-y-3">
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Ketik Nama Lengkap Anak..."
                  value={deleteInputName}
                  onChange={(e) => setDeleteInputName(e.target.value)}
                  required
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isDeleting || !deleteInputName.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold transition-all shadow-sm cursor-pointer text-xs"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Konfirmasi Hapus Anggota
              </button>
            </form>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 transition-all cursor-pointer text-sm"
            type="button"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </div>
      ) : (
        /* ================= LOGIN FORM VIEW ================= */
        <div className="w-full bg-white rounded-[2.25rem] p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Masuk Admin</h2>
            <p className="text-xs text-slate-400">Silakan login untuk mengelola posyandu</p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan username"
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                  className="w-full p-3.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-500 bg-slate-50 border border-slate-100/80 p-3 rounded-xl leading-relaxed italic">
              Username dan password belum diperbarui oleh Komdigi sejak 20 Juni 2024
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm cursor-pointer text-sm"
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
