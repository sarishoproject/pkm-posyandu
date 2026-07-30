import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Download,
  Eye,
  EyeOff,
  HelpCircle,
  Key,
  Loader2,
  LogIn,
  LogOut,
  Printer,
  QrCode,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export const Route = createFileRoute("/pengaturan/")({
  component: AkunPage,
});

interface Peserta {
  id: number;
  nama_anak: string;
  nik: string;
  qr_code?: string;
}

function AkunPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showAllQr, setShowAllQr] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Peserta | null>(null);

  const downloadSingleQR = (member: Peserta) => {
    const canvas = document.getElementById(`modal-qr-canvas-${member.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode_${member.nama_anak.replace(/\s+/g, "_").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    document.title = "Pengaturan | Posyandu";
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Manage Members State
  const [members, setMembers] = useState<Peserta[]>([]);
  const [deleteInputName, setDeleteInputName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    window.dispatchEvent(new Event("auth-change"));
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

    const targetName = deleteInputName.trim().toLowerCase();
    const matchedMember = members.find(
      (m) => m.nama_anak.toLowerCase() === targetName,
    );

    if (!matchedMember) {
      setDeleteError(
        "Nama lengkap anak tidak ditemukan / tidak cocok. Pastikan ejaan tepat.",
      );
      return;
    }

    const confirmed = await window.showCustomConfirm(
      `Yakin ingin menghapus anggota "${matchedMember.nama_anak}" beserta seluruh riwayat pengukurannya?`,
    );
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
        setIsDeleteModalOpen(false);
        window.dispatchEvent(new Event("auth-change")); // Refresh stats on home
        await window.showCustomAlert(
          `Anggota "${matchedMember.nama_anak}" berhasil dihapus.`,
        );
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

  if (showAllQr) {
    return (
      <div className="flex-1 flex flex-col w-full max-w-md mx-auto bg-white min-h-screen pb-12 print-container">
        <style>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .no-print, nav, footer, .fixed {
              display: none !important;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-w-none !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .print-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              gap: 1.5cm !important;
            }
            .break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}</style>
        
        {/* Header (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
          <button
            onClick={() => setShowAllQr(false)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/50"
            type="button"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </button>
          <span className="font-bold text-slate-800 text-sm">QR Code Semua Anggota</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm hover:shadow-md cursor-pointer transition-all"
            type="button"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak (PDF)
          </button>
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 p-6 print-grid">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center text-center p-2 break-inside-avoid cursor-pointer hover:opacity-80 transition-all select-none"
              onClick={() => setSelectedMember(member)}
            >
              {member.qr_code ? (
                <div className="bg-white p-2 rounded-xl flex items-center justify-center">
                  <QRCodeCanvas
                    id={`qr-canvas-${member.id}`}
                    value={`http://${window.location.host}/anggota/${member.qr_code}/pengukuran/tambah`}
                    size={110}
                    level="M"
                  />
                </div>
              ) : (
                <div className="w-[110px] h-[110px] bg-slate-100 flex items-center justify-center rounded-xl text-[10px] text-slate-400 font-semibold">
                  Belum ada QR
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">
                {member.nama_anak}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">
                NIK: {member.nik || "-"}
              </span>
            </div>
          ))}
        </div>

        {/* Detail QR Code Modal */}
        {selectedMember && (
          <div
            className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="bg-white rounded-[2rem] p-6 max-w-xs w-full shadow-2xl border border-slate-100/50 flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                onClick={() => setSelectedMember(null)}
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 mt-2">
                <h3 className="font-extrabold text-slate-800 text-sm leading-tight line-clamp-2 px-2">
                  {selectedMember.nama_anak}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  NIK: {selectedMember.nik || "-"}
                </p>
              </div>

              {selectedMember.qr_code ? (
                <div className="bg-white p-3 rounded-2xl border border-slate-100/60 flex items-center justify-center shadow-inner">
                  <QRCodeCanvas
                    id={`modal-qr-canvas-${selectedMember.id}`}
                    value={`http://${window.location.host}/anggota/${selectedMember.qr_code}/pengukuran/tambah`}
                    size={160}
                    level="H"
                  />
                </div>
              ) : (
                <div className="w-[160px] h-[160px] bg-slate-100 flex items-center justify-center rounded-2xl text-xs text-slate-400 font-semibold">
                  Belum ada QR
                </div>
              )}

              <div className="w-full pt-1">
                {selectedMember.qr_code && (
                  <button
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                    onClick={() => downloadSingleQR(selectedMember)}
                    type="button"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh PNG
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 max-w-md mx-auto w-full min-h-[85vh] space-y-6 pb-24">
      {isLoggedIn ? (
        /* ================= ADMIN VIEW ================= */
        <div className="w-full space-y-6">
          {/* Profile Header */}
          <div className="w-full text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Admin Posyandu
              </h2>
              <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                Administrator
              </div>
            </div>
          </div>

          {/* Quick Actions (Export Only) */}
          <div className="w-full space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Aksi Cepat
            </h3>

            {/* Export Data Button */}
            <button
              className="w-full flex items-center justify-between py-1 hover:opacity-80 transition-all text-left cursor-pointer"
              onClick={handleExport}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">
                    Ekspor Laporan Excel
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Download data rekap posyandu
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Unduh
              </span>
            </button>

            <hr className="border-slate-100/60 mt-2" />

            {/* Bersihkan Riwayat Pencarian */}
            <button
              className="w-full flex items-center justify-between py-1.5 hover:opacity-80 transition-all text-left cursor-pointer"
              onClick={async () => {
                localStorage.removeItem("recent_searches");
                await window.showCustomAlert(
                  "Riwayat pencarian telah dibersihkan!",
                );
              }}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">
                    Bersihkan Riwayat Cari
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Hapus riwayat pencarian anggota di HP ini
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Hapus
              </span>
            </button>
          </div>

          {/* Keanggotaan Section */}
          <div className="w-full space-y-4 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Keanggotaan
            </h3>

            <div className="space-y-3">
              {/* Tambah Anggota Button */}
              <Link
                className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-all text-left cursor-pointer"
                to="/anggota/tambah"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Tambah Anggota Baru
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Registrasi anak/balita baru
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Buka
                </span>
              </Link>

              {/* Tampilkan Semua Kode QR Button */}
              <button
                className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-all text-left cursor-pointer"
                onClick={() => setShowAllQr(true)}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Tampilkan Semua Kode QR
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Lihat dan cetak kartu QR Code semua anggota
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Lihat
                </span>
              </button>

              {/* Hapus Anggota Button */}
              <button
                className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-all text-left cursor-pointer"
                onClick={() => setIsDeleteModalOpen(true)}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Hapus Anggota
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Hapus permanen data anggota & riwayat
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Buka
                </span>
              </button>
            </div>
          </div>

          {/* Bantuan Section */}
          <div className="w-full space-y-4 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bantuan
            </h3>

            <div className="space-y-3">
              {/* Tutorial Penggunaan */}
              <button
                className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-all text-left cursor-pointer"
                onClick={async () => {
                  await window.showCustomAlert(
                    "Fitur Tutorial Penggunaan akan segera hadir!",
                  );
                }}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Tutorial Penggunaan
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Panduan cara input & kelola data posyandu
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Baca
                </span>
              </button>

              {/* Bantuan & Dukungan */}
              <button
                className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-all text-left cursor-pointer"
                onClick={async () => {
                  await window.showCustomAlert(
                    "Layanan Bantuan & Dukungan hubungi admin IT posyandu.",
                  );
                }}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Bantuan & Dukungan
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Hubungi tim support jika terjadi error
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Tanya
                </span>
              </button>
            </div>
          </div>

          {/* Zona Berbahaya Section */}
          <div className="w-full space-y-4 pt-4">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider">
              Zona Berbahaya
            </h3>

            <div className="space-y-3">
              {/* Logout Button */}
              <button
                className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-all text-left cursor-pointer"
                onClick={handleLogout}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-650 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Keluar Akun
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Keluar dari sesi administrator
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Keluar
                </span>
              </button>
            </div>
          </div>

          {/* MODAL HAPUS ANGGOTA */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              {/* Backdrop click to close */}
              <button
                aria-label="Tutup modal"
                className="absolute inset-0 z-10 cursor-default"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteInputName("");
                  setDeleteError("");
                }}
                type="button"
              />

              <div className="relative z-20 bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-[15px]">
                    Hapus Anggota
                  </h3>
                  <button
                    className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeleteInputName("");
                      setDeleteError("");
                    }}
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Konten Modal */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Untuk mencegah ketidaksengajaan, silakan ketik **Nama
                    Lengkap Anak** secara tepat dan sesuai ejaan.
                  </p>

                  {deleteError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-650 rounded-xl text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{deleteError}</span>
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleDeleteByName}>
                    <input
                      className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white text-xs text-slate-800"
                      onChange={(e) => setDeleteInputName(e.target.value)}
                      placeholder="Ketik Nama Lengkap Anak..."
                      required
                      type="text"
                      value={deleteInputName}
                    />

                    <div className="flex gap-3 pt-2">
                      <button
                        className="flex-1 py-3 bg-slate-150 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200"
                        onClick={() => {
                          setIsDeleteModalOpen(false);
                          setDeleteInputName("");
                          setDeleteError("");
                        }}
                        type="button"
                      >
                        Batal
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold transition-all shadow-sm cursor-pointer text-xs"
                        disabled={isDeleting || !deleteInputName.trim()}
                        type="submit"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Hapus
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= LOGIN FORM VIEW ================= */
        <div className="w-full space-y-6 py-4">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Masuk Admin</h2>
            <p className="text-xs text-slate-400">
              Silakan login untuk mengelola posyandu
            </p>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm text-slate-800"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                type="text"
                value={username}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full p-3.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm text-slate-800"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-500 bg-slate-50 border border-slate-100/80 p-3 rounded-xl leading-relaxed italic">
              Username dan password belum diperbarui oleh Komdigi sejak 20 Juni
              2024
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm cursor-pointer text-sm"
              type="submit"
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
