import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Radio } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/anggota/$id/pengukuran/$pengukuranId")({
  component: EditMeasurementForm,
});

function EditMeasurementForm() {
  const { id, pengukuranId } = Route.useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSensorLoading, setIsSensorLoading] = useState(false);

  const [formData, setFormData] = useState({
    tanggal_ukur: "",
    berat: "",
    tinggi: "",
    lingkar_kepala: "",
    lila: "",
    pitting_edema: false,
    cara_ukur: "Berdiri",
    asi: "",
  });

  const isFormComplete =
    formData.berat !== "" &&
    formData.tinggi !== "" &&
    formData.lingkar_kepala !== "" &&
    formData.lila !== "";
  formData.asi !== "";

  const [childName, setChildName] = useState("");

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = await fetch(`/api/peserta/${id}`);
        if (res.ok) {
          const childData = await res.json();
          setChildName(childData.nama_anak);
          document.title = `Edit Pengukuran ${childData.nama_anak} | Posyandu`;
        }
      } catch (err) {
        console.error("Gagal memuat nama anak:", err);
      }
    };
    fetchChild();
  }, [id]);

  // 1. Ambil Data Lama
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await fetch(`/api/pendataan/${pengukuranId}`);
        if (!response.ok) throw new Error("Data tidak ditemukan");

        const data = await response.json();

        setFormData({
          tanggal_ukur: data.tanggal_ukur
            ? data.tanggal_ukur.split("T")[0]
            : "",
          berat: data.berat?.toString() || "",
          tinggi: data.tinggi?.toString() || "",
          lingkar_kepala: data.lingkar_kepala?.toString() || "",
          lila: data.lila?.toString() || "",
          pitting_edema: data.pitting_edema === "Ya",
          cara_ukur: data.cara_ukur || "Berdiri",
          asi: data.asi
            ? data.asi.toLowerCase() === "ya"
              ? "Ya"
              : "Tidak"
            : "",
        });
      } catch (error) {
        console.error("Error:", error);
        await window.showCustomAlert("Gagal memuat data lama.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchExistingData();
  }, [pengukuranId]);

  // 2. Fungsi Ambil Data dari Sensor
  const handleSimulateSensor = async () => {
    setIsSensorLoading(true);
    try {
      const [weightRes, heightRes] = await Promise.all([
        fetch("https://mock.fadlanabduh.my.id/api/weight"),
        fetch("https://mock.fadlanabduh.my.id/api/height"),
      ]);

      if (!weightRes.ok || !heightRes.ok)
        throw new Error("Gagal terhubung ke sensor alat ukur.");

      const weightData = await weightRes.json();
      const heightData = await heightRes.json();

      const hasilBerat = weightData.weight ?? weightData.value ?? weightData;
      const hasilTinggi = heightData.height ?? heightData.value ?? heightData;

      setFormData((prev) => ({
        ...prev,
        berat: Number(hasilBerat).toFixed(1),
        tinggi: Number(hasilTinggi).toFixed(1),
      }));
    } catch (error) {
      console.error("Error membaca sensor:", error);
      await window.showCustomAlert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data dari sensor otomatis.",
      );
    } finally {
      setIsSensorLoading(false);
    }
  };

  // 3. Fungsi Submit Edit (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        berat: formData.berat ? Number(formData.berat) : null,
        tinggi: formData.tinggi ? Number(formData.tinggi) : null,
        lingkar_kepala: formData.lingkar_kepala
          ? Number(formData.lingkar_kepala)
          : null,
        lila: formData.lila ? Number(formData.lila) : null,
        pitting_edema: formData.pitting_edema ? "Ya" : "Tidak",
        asi: formData.asi,
      };

      const response = await fetch(`/api/pendataan/${pengukuranId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.error || "Gagal menyimpan perubahan ke server",
        );
      }

      await window.showCustomAlert("Data pengukuran berhasil diperbarui!");

      navigate({
        to: "/anggota/$id",
        params: { id },
      });
    } catch (error) {
      console.error("Error submit data:", error);
      await window.showCustomAlert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#373895] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-4xl mx-auto flex flex-col relative">
        {/* Header */}
        <div className="pb-6 flex items-center gap-2 border-b border-slate-200/65 mb-8">
          <button
            className="p-2 -ml-2 text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
            onClick={() => window.history.back()}
            type="button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-800">
            Edit Data Pengukuran
          </h1>
        </div>

        <div className="px-5 pb-8 flex-1 overflow-y-auto md:p-8 md:overflow-visible">
          <form
            className="md:grid md:grid-cols-2 md:gap-10 lg:gap-14 h-full flex flex-col"
            onSubmit={handleSubmit}
          >
            {/* ================= KOLOM KIRI ================= */}
            <div className="flex flex-col">
              <div className="relative bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 mb-8 overflow-hidden md:border-slate-200 md:shadow-md">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-orange-300 rounded-r-full" />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 ml-1 text-xs">
                  ID: {id || "..."}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-[16px]">
                    {childName || "Data Peserta"}
                  </span>
                  <span className="text-sm text-slate-500 mt-0.5">
                    Koreksi pengukuran
                  </span>
                </div>
              </div>

              <div className="mb-6 md:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    Sensor Otomatis
                  </h3>
                  <span className="text-[10px] font-medium text-slate-400">
                    Tgl: {formData.tanggal_ukur || "--"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 md:border-slate-200 md:shadow-md md:py-6 relative">
                    <span className="text-xs text-slate-500 mb-2 text-center">
                      Berat Badan (kg)
                    </span>
                    <span
                      className={`text-2xl font-bold ${formData.berat ? "text-indigo-600" : "text-slate-800"}`}
                    >
                      {formData.berat || "--"}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100 md:border-slate-200 md:shadow-md md:py-6 relative">
                    <span className="text-xs text-slate-500 mb-2 text-center">
                      Tinggi Badan (cm)
                    </span>
                    <span
                      className={`text-2xl font-bold ${formData.tinggi ? "text-orange-500" : "text-slate-800"}`}
                    >
                      {formData.tinggi || "--"}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-3.5 md:py-4 rounded-full border-2 border-indigo-200 text-indigo-700 font-semibold flex justify-center items-center gap-2 hover:bg-indigo-50 transition-colors disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                  disabled={isSensorLoading}
                  onClick={handleSimulateSensor}
                  type="button"
                >
                  {isSensorLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Membaca Sensor...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-5 h-5" />
                      <span>Ukur Ulang (Sensor)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <hr className="border-slate-200 my-6 md:hidden" />

            {/* ================= KOLOM KANAN ================= */}
            <div className="flex flex-col space-y-4 h-full flex-1">
              <div className="flex-1">
                <h3 className="hidden md:block text-xs font-bold text-slate-500 tracking-wider mb-4 uppercase">
                  Input Manual & Data Tambahan
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold text-slate-700"
                      htmlFor="lingkar_kepala"
                    >
                      Lingkar Kepala (cm)
                    </label>
                    <input
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm"
                      id="lingkar_kepala"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lingkar_kepala: e.target.value,
                        })
                      }
                      placeholder="Contoh: 45.5"
                      required
                      step="0.1"
                      type="number"
                      value={formData.lingkar_kepala}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-xs font-semibold text-slate-700"
                      htmlFor="lila"
                    >
                      Lingkar Lengan (cm)
                    </label>
                    <input
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm"
                      id="lila"
                      onChange={(e) =>
                        setFormData({ ...formData, lila: e.target.value })
                      }
                      placeholder="Contoh: 14.5"
                      required
                      step="0.1"
                      type="number"
                      value={formData.lila}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-4">
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="cara_ukur"
                  >
                    Cara Ukur Tinggi
                  </label>
                  <select
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm appearance-none cursor-pointer"
                    id="cara_ukur"
                    onChange={(e) =>
                      setFormData({ ...formData, cara_ukur: e.target.value })
                    }
                    value={formData.cara_ukur}
                  >
                    <option value="Berdiri">Berdiri</option>
                    <option value="Terlentang">Terlentang</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input
                    checked={formData.pitting_edema}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    id="edema"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pitting_edema: e.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                  <label
                    className="text-sm text-slate-700 font-medium cursor-pointer"
                    htmlFor="edema"
                  >
                    Pitting Edema
                  </label>
                </div>
                <select
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white md:bg-slate-50 text-sm appearance-none cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, asi: e.target.value })
                  }
                  value={formData.asi}
                >
                  <option disabled value="">
                    -- Pilih Status ASI --
                  </option>
                  <option value="Tidak">Tidak</option>
                  <option value="Ya">Ya</option>
                </select>
              </div>

              <div className="mt-10 md:mt-auto pt-4 md:pt-8">
                {/* Tombol Simpan */}
                <button
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#1E1B4B] text-white font-semibold hover:bg-indigo-900 transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed"
                  disabled={isLoading || !isFormComplete}
                  type="submit"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan Data...
                    </>
                  ) : isFormComplete ? (
                    "Simpan Perubahan"
                  ) : (
                    "Lengkapi Data Dahulu"
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
