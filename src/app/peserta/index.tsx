import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Tipe data Peserta (sesuai backend)
interface Peserta {
  asi_bulan_0: string;
  asi_bulan_3: string;
  id: number;
  nama_anak: string;
  nama_ibu: string | null;
  nik: string;
  qr_code: string | null;
  status: string;
}

// --- Fetcher Functions ---
const fetchPeserta = async (): Promise<Peserta[]> => {
  const res = await fetch("/api/peserta");
  if (!res.ok) throw new Error("Gagal memuat data");
  return res.json();
};

const createPeserta = async (data: { nik: string; nama_anak: string }) => {
  const res = await fetch("/api/peserta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menambah peserta");
  return res.json();
};

const updatePeserta = async (id: number, data: Partial<Peserta>) => {
  const res = await fetch(`/api/peserta/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal update peserta");
  return res.json();
};

// --- Page Component ---
function PesertaPage() {
  const queryClient = useQueryClient();
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");

  // Read (Fetch data)
  const { data: pesertaList, isLoading } = useQuery({
    queryKey: ["peserta"],
    queryFn: fetchPeserta,
  });

  // Create (Tambah data)
  const addMutation = useMutation({
    mutationFn: createPeserta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peserta"] });
      setNik("");
      setNama("");
    },
  });

  // Update (Contoh: Update ASI Bulan 3)
  const updateMutation = useMutation({
    mutationFn: (peserta: Peserta) =>
      updatePeserta(peserta.id, {
        asi_bulan_3: peserta.asi_bulan_3 === "ya" ? "tidak" : "ya",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peserta"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || !nama) return;
    addMutation.mutate({ nik, nama_anak: nama });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Master Data Peserta</h1>

      {/* Form Tambah Peserta Simpel */}
      <form className="flex gap-2 mb-8" onSubmit={handleSubmit}>
        <input
          className="border p-2 rounded flex-1"
          onChange={(e) => setNik(e.target.value)}
          placeholder="NIK Anak"
          value={nik}
        />
        <input
          className="border p-2 rounded flex-1"
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama Anak"
          value={nama}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          type="submit"
        >
          Tambah
        </button>
      </form>

      {/* Tabel List Peserta */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">NIK</th>
              <th className="p-2">Nama Anak</th>
              <th className="p-2">ASI Bulan 3</th>
            </tr>
          </thead>
          <tbody>
            {pesertaList?.map((p) => (
              <tr className="border-b" key={p.id}>
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.nik}</td>
                <td className="p-2">{p.nama_anak}</td>
                <td className="p-2">
                  {/* Tombol Test Update ASI */}
                  <Button
                    className={`px-2 py-1 rounded text-xs ${
                      p.asi_bulan_3 === "ya"
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-800"
                    }`}
                    onClick={() => updateMutation.mutate(p)}
                    type="button"
                  >
                    {p.asi_bulan_3 || "tidak"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const Route = createFileRoute("/peserta/")({
  component: PesertaPage,
});
