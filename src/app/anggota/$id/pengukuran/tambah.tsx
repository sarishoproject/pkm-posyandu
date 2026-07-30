import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Radio } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/anggota/$id/pengukuran/tambah")({
  component: MeasurementForm,
});

interface ChildData {
  asi_bulan_0?: string;
  asi_bulan_1?: string;
  asi_bulan_2?: string;
  asi_bulan_3?: string;
  asi_bulan_4?: string;
  asi_bulan_5?: string;
  asi_bulan_6?: string;
  nama_anak: string;
  nik: string;
  tanggal_lahir: string | null;
}

function MeasurementForm() {
  const navigate = useNavigate();
  const { id } = Route.useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isSensorLoading, setIsSensorLoading] = useState(false);
  const [child, setChild] = useState<ChildData | null>(null);
  const [asiInfo, setAsiInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const response = await fetch(`/api/peserta/${id}`);
        if (!response.ok) throw new Error("Gagal mengambil data");
        const data: ChildData = await response.json();
        setChild(data);
        document.title = `Input Pengukuran ${data.nama_anak} | Posyandu`;

        // Hitung umur bulan & fetch status ASI
        if (data.tanggal_lahir) {
          const birth = new Date(data.tanggal_lahir);
          const now = new Date();
          let months = (now.getFullYear() - birth.getFullYear()) * 12;
          months -= birth.getMonth();
          months += now.getMonth();
          if (now.getDate() < birth.getDate()) months--;

          const umurBulan = months < 0 ? 0 : months;

          if (umurBulan <= 6) {
            const asiStatus = data[`asi_bulan_${umurBulan}` as keyof ChildData];
            setAsiInfo(asiStatus === "ya" ? "Ya" : "Tidak");
          } else {
            setAsiInfo(null); // Umur > 6 bulan, tidak perlu tampilkan ASI
          }
        }
      } catch (error) {
        console.error("Error fetching child:", error);
      }
    };
    fetchChild();
  }, [id]);

  const getInitials = (name: string) => {
    if (!name) return "AN";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const [formData, setFormData] = useState({
    peserta_id: Number(id),
    tanggal_ukur: new Date().toISOString().split("T")[0],
    berat: "",
    tinggi: "",
    lingkar_kepala: "",
    lila: "",
    pitting_edema: false,
    cara_ukur: "Berdiri",
  });

  const isFormComplete =
    formData.berat !== "" &&
    formData.tinggi !== "" &&
    formData.lingkar_kepala !== "" &&
    formData.lila !== "";

  const handleSimulateSensor = async () => {
    setIsSensorLoading(true);

    try {
      const [weightRes, heightRes] = await Promise.all([
        fetch("https://mock.fadlanabduh.my.id/api/weight"),
        fetch("https://mock.fadlanabduh.my.id/api/height"),
      ]);

      if (!weightRes.ok || !heightRes.ok) {
        throw new Error("Gagal terhubung ke sensor alat ukur.");
      }

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
        (error as Error).message ||
          "Gagal mengambil data dari sensor otomatis.",
      );
    } finally {
      setIsSensorLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Hapus payload asi, karena asi sudah dikelola di data peserta
      const payload = {
        ...formData,
        berat: formData.berat ? Number(formData.berat) : null,
        tinggi: formData.tinggi ? Number(formData.tinggi) : null,
        lingkar_kepala: formData.lingkar_kepala
          ? Number(formData.lingkar_kepala)
          : null,
        lila: formData.lila ? Number(formData.lila) : null,
        pitting_edema: formData.pitting_edema ? "Ya" : "Tidak",
      };

      const response = await fetch("/api/pendataan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menyimpan data");
      }

      await window.showCustomAlert("Data pengukuran berhasil disimpan!");
      navigate({ to: "/anggota/$id", params: { id } });
    } catch (error) {
      console.error("Error submit data:", error);
      await window.showCustomAlert(
        (error as Error).message ||
          "Terjadi kesalahan pada sistem saat menyimpan data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md md:max-w-4xl mx-auto flex flex-col relative md:bg-white md:rounded-[2rem] md:shadow-xl md:overflow-hidden md:min-h-[auto]">
        <div className="p-4 md:px-8 md:pt-8 md:pb-4 flex items-center md:border-b md:border-slate-100">
          <button
            className="p-2 -ml-2 text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
            onClick={() => window.history.back()}
            type="button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="hidden md:block ml-2 text-lg font-bold text-slate-800">
            Input Data Pengukuran
          </h1>
        </div>

        <div className="px-5 pb-8 flex-1 overflow-y-auto md:p-8 md:overflow-visible">
          <form
            className="md:grid md:grid-cols-2 md:gap-10 lg:gap-14 h-full flex flex-col"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col">
              <div className="relative bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 mb-8 overflow-hidden md:border-slate-200 md:shadow-md">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded-r-full" />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 ml-1 text-sm tracking-wider">
                  {child ? getInitials(child.nama_anak) : `ID: ${id}`}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-[16px] line-clamp-1">
                    {child ? child.nama_anak : "Data Peserta"}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">
                    {child ? `NIK: ${child.nik}` : "Memuat data peserta..."}
                  </span>
                </div>
              </div>

              {/* ================= INFO ASI OTOMATIS ================= */}
              {asiInfo !== null && (
                <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Status ASI Bulan Ini
                    </span>
                    <span className="text-sm font-bold text-slate-800 mt-1">
                      {asiInfo === "Ya"
                        ? "Mendapat ASI Eksklusif"
                        : "Tidak Mendapat ASI"}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${asiInfo === "Ya" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {asiInfo}
                  </span>
                </div>
              )}

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
                      <span>
                        {formData.berat
                          ? "Ukur Ulang (Sensor)"
                          : "Ukur BB & TB (Sensor)"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <hr className="border-slate-200 my-6 md:hidden" />

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
              </div>

              <div className="mt-10 md:mt-auto pt-4 md:pt-8">
                <button
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#373895] text-white font-semibold hover:bg-indigo-800 transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed"
                  disabled={isLoading || !isFormComplete}
                  type="submit"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan Data...
                    </>
                  ) : isFormComplete ? (
                    "Simpan Data Pengukuran"
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
