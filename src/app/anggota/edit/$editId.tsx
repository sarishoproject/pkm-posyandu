import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/anggota/edit/$editId")({
  component: EditMemberForm,
});

function EditMemberForm() {
  // Mengambil parameter editId dari URL TanStack Router
  const { editId } = Route.useParams();
  const navigate = useNavigate();

  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // State disesuaikan dengan Form UI
  const [formData, setFormData] = useState({
    nama_anak: "",
    nik: "",
    nama_ibu: "",
    // UI Only (Karena belum ada di DB)
    jenis_kelamin: "Laki-laki",
    tgl_lahir: "",
    bulan_lahir: "",
    tahun_lahir: "",
  });

  // Fetch data lama saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await fetch(`/api/peserta/${editId}`);
        if (!response.ok) throw new Error("Data tidak ditemukan");

        const data = await response.json();

        // Memasukkan data lama ke dalam state form
        setFormData((prev) => ({
          ...prev,
          nama_anak: data.nama_anak || "",
          nik: data.nik || "",
          nama_ibu: data.nama_ibu || "",
          // Jika suatu saat ada tanggal lahir di DB, bisa di-split dan dimasukkan ke sini
        }));
      } catch (error) {
        console.error("Error fetching detail:", error);
        alert("Gagal memuat data anggota.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchExistingData();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Siapkan payload sesuai kolom yang ada di DB saat ini
      const payload = {
        nama_anak: formData.nama_anak,
        nik: formData.nik,
        nama_ibu: formData.nama_ibu,
      };

      // 2. Kirim ke API endpoint (Pastikan backend Anda sudah punya method PUT/PATCH untuk update)
      const response = await fetch(`/api/peserta/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan perubahan");
      }

      alert("Data anggota berhasil diperbarui!");
      // Arahkan kembali ke halaman info detail anak tersebut
      navigate({ to: `/anggota/info/${editId}` });
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat memperbarui data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tampilkan loading screen saat sedang menarik data dari database
  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#23257B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 font-sans md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto flex flex-col relative md:bg-white md:rounded-[2rem] md:shadow-xl md:overflow-hidden min-h-screen md:min-h-[auto] md:border md:border-slate-100">
        <div className="p-4 md:px-8 md:pt-8 flex items-center gap-3">
          <Link
            className="p-1 -ml-1 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            to={`/anggota/info/${editId}`}
          >
            <X className="w-6 h-6" />
          </Link>
          <h1 className="text-[17px] font-medium text-slate-800">
            Edit Data Anggota
          </h1>
        </div>

        <div className="px-5 pt-2 pb-8 flex-1 flex flex-col md:px-8">
          <form
            className="space-y-5 flex-1 flex flex-col"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">
                Nama Anak
              </label>
              <input
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, nama_anak: e.target.value })
                }
                placeholder="Masukkan nama lengkap anak"
                required
                type="text"
                value={formData.nama_anak}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">
                NIK (Nomor Induk Kependudukan)
              </label>
              <input
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                maxLength={16}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nik: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="16 digit NIK"
                required
                type="text"
                value={formData.nik}
              />
            </div>

            {/* JENIS KELAMIN - Hanya untuk UI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">
                Jenis Kelamin
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-medium text-sm transition-colors ${
                    formData.jenis_kelamin === "Laki-laki"
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, jenis_kelamin: "Laki-laki" })
                  }
                  type="button"
                >
                  <span className="text-lg leading-none">♂</span> Laki-laki
                </button>

                <button
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-medium text-sm transition-colors ${
                    formData.jenis_kelamin === "Perempuan"
                      ? "border-pink-400 bg-pink-50 text-pink-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, jenis_kelamin: "Perempuan" })
                  }
                  type="button"
                >
                  <span className="text-lg leading-none">♀</span> Perempuan
                </button>
              </div>
            </div>

            {/* TANGGAL LAHIR - Hanya untuk UI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">
                Tanggal Lahir Anak
              </label>
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
                <select
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white text-sm appearance-none cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, tgl_lahir: e.target.value })
                  }
                  value={formData.tgl_lahir}
                >
                  <option value="">Tgl</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <select
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white text-sm appearance-none cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, bulan_lahir: e.target.value })
                  }
                  value={formData.bulan_lahir}
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
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, tahun_lahir: e.target.value })
                  }
                  placeholder="Tahun"
                  type="number"
                  value={formData.tahun_lahir}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-600">
                Nama Ibu Kandung
              </label>
              <input
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, nama_ibu: e.target.value })
                }
                placeholder="Masukkan nama ibu"
                type="text"
                value={formData.nama_ibu}
              />
            </div>

            <div className="mt-auto pt-8">
              <button
                className="w-full flex items-center justify-center py-4 rounded-xl bg-[#23257B] text-white font-medium text-sm hover:bg-[#1a1c5e] transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
