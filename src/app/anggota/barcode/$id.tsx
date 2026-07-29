import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react"; // Import versi Canvas agar bisa di-download

export const Route = createFileRoute("/anggota/barcode/$id")({
  component: BarcodeView,
});

interface DetailResponse {
  id: number;
  nama_anak: string;
  nik: string;
  qr_code?: string; // Pastikan ini ada dari backend
}

function BarcodeView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<DetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/peserta/${id}`);
        if (!response.ok) throw new Error("Data tidak ditemukan");
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Fungsi untuk Mendownload QR Code sebagai PNG
  const handleDownloadQR = () => {
    // 1. Ambil elemen canvas dari DOM
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    // 2. Ubah canvas menjadi URL gambar PNG
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    // 3. Buat elemen link <a> sementara untuk men-trigger download
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    
    // Nama file dinamis: "QR_Nama_Anak.png"
    const safeName = data?.nama_anak.replace(/\s+/g, "_") || "Anak";
    downloadLink.download = `QR_${safeName}.png`;
    
    // 4. Klik link tersebut secara otomatis, lalu hapus
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-900 animate-spin" />
      </div>
    );
  }

  // PENTING: Gunakan IP Lokal Anda (contoh: 192.168.x.x) jika ingin di-scan betulan pakai HP.
  // Jika pakai 'localhost', HP Anda tidak akan bisa membuka linknya.
  const host = window.location.host; // otomatis mengambil localhost:5173 atau IP Anda
  const scanUrl = `http://${host}/anggota/input/${data.qr_code}`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center pt-10 px-4">
      {/* Header Navigasi */}
      <div className="w-full max-w-md flex items-center mb-8">
        <button
          className="p-2 -ml-2 text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          onClick={() => navigate({ to: `/anggota/info/${id}` })}
          type="button"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 ml-2">Kartu Identitas Anak</h1>
      </div>

      {/* Kartu QR Code */}
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-1">{data.nama_anak}</h2>
        <p className="text-slate-500 font-medium text-sm mb-8">NIK: {data.nik}</p>

        {/* Kontainer QR Code (Diberi padding & border agar rapi saat didownload) */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm mb-8">
          {data.qr_code ? (
            <QRCodeCanvas
              id="qr-canvas" // ID ini penting untuk dipanggil di fungsi download
              value={scanUrl}
              size={200}
              level={"H"} // High error correction (lebih mudah discan)
              includeMargin={true}
            />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
              Barcode belum di-generate
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-6 px-4">
          Scan QR Code ini untuk langsung membuka halaman input pengukuran anak.
        </p>

        {/* Tombol Download */}
        <button
          onClick={handleDownloadQR}
          disabled={!data.qr_code}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Download QR Code</span>
        </button>
      </div>
    </div>
  );
}