import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";

export const Route = createFileRoute("/anggota/tambah/")({
  component: TambahAnggotaForm,
});

function TambahAnggotaForm() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama_anak: "",
    nik: "",
    nama_ibu: "",
    jenis_kelamin: "Laki-laki",
    tgl_lahir: "",
    bulan_lahir: "",
    tahun_lahir: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.nik.length !== 16) {
      setError("NIK harus terdiri dari tepat 16 digit angka.");
      return;
    }

    const tahunInput = parseInt(formData.tahun_lahir, 10);
    const tahunSekarang = new Date().getFullYear();

    if (!tahunInput || tahunInput < 2000 || tahunInput > tahunSekarang) {
      setError(
        `Tahun lahir tidak valid! Harap masukkan tahun antara 2000 - ${tahunSekarang}.`,
      );
      return;
    }

    setIsLoading(true);
    const formatBulan = formData.bulan_lahir.padStart(2, "0");
    const formatTgl = formData.tgl_lahir.padStart(2, "0");
    const fullTanggalLahir = `${formData.tahun_lahir}-${formatBulan}-${formatTgl}`;

    try {
      const payload = {
        nama_anak: formData.nama_anak,
        nik: formData.nik,
        nama_ibu: formData.nama_ibu || null,
        jenis_kelamin: formData.jenis_kelamin,
        tanggal_lahir: fullTanggalLahir,
        status: "aktif",
      };

      const response = await fetch("/api/peserta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Gagal menyimpan data anggota baru");
      }

      await window.showCustomAlert("Anggota baru berhasil ditambahkan!");
      navigate({ to: "/anggota" });
    } catch (err) {
      console.error("Error tambah anggota:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 font-sans md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto flex flex-col relative md:bg-white md:rounded-[2rem] md:shadow-xl md:overflow-hidden min-h-screen md:min-h-[auto] md:border md:border-slate-100">
        <div className="p-4 md:px-8 md:pt-8 flex items-center gap-3">
          <button
            className="p-1 -ml-1 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            onClick={() => window.history.back()}
            type="button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[17px] font-medium text-slate-800">
            Tambah Anggota Baru
          </h1>
        </div>

        <div className="px-5 pt-2 pb-8 flex-1 flex flex-col md:px-8 overflow-y-auto">
          <form
            className="space-y-5 flex-1 flex flex-col"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-semibold text-slate-600"
                htmlFor="nama"
              >
                Nama Anak
              </label>
              <input
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                id="nama"
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
              <label
                className="text-[11px] font-semibold text-slate-600"
                htmlFor="nik"
              >
                NIK (Nomor Induk Kependudukan)
              </label>
              <input
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                id="nik"
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

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-600">
                Jenis Kelamin
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-medium text-sm transition-colors ${formData.jenis_kelamin === "Laki-laki" ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  onClick={() =>
                    setFormData({ ...formData, jenis_kelamin: "Laki-laki" })
                  }
                  type="button"
                >
                  <span className="text-lg leading-none">♂</span> Laki-laki
                </button>
                <button
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-medium text-sm transition-colors ${formData.jenis_kelamin === "Perempuan" ? "border-pink-400 bg-pink-50 text-pink-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  onClick={() =>
                    setFormData({ ...formData, jenis_kelamin: "Perempuan" })
                  }
                  type="button"
                >
                  <span className="text-lg leading-none">♀</span> Perempuan
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-600">
                Tanggal Lahir Anak
              </span>
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
                <select
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 bg-white text-sm appearance-none cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, tgl_lahir: e.target.value })
                  }
                  value={formData.tgl_lahir}
                >
                  <option value="">Tgl</option>
                  {Array.from({ length: 31 }, (_, i) => {
                    const d = i + 1;
                    return (
                      <option key={`tgl-${d}`} value={String(d)}>
                        {d}
                      </option>
                    );
                  })}
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
                  max={new Date().getFullYear()}
                  min="2000"
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
              <label
                className="text-[11px] font-semibold text-slate-600"
                htmlFor="nama_ibu"
              >
                Nama Ibu Kandung
              </label>
              <input
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white text-sm"
                id="nama_ibu"
                onChange={(e) =>
                  setFormData({ ...formData, nama_ibu: e.target.value })
                }
                placeholder="Masukkan nama ibu"
                type="text"
                value={formData.nama_ibu}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span className="flex-1">{error}</span>
              </div>
            )}

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
                  "Simpan Anggota"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
