import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Html5Qrcode } from "html5-qrcode";
import {
  AlertCircle,
  CheckCircle2,
  FlipHorizontal,
  Home,
  Loader2,
  QrCode,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import React from "react";

// Add global TypeScript typings for custom alert/confirm handlers
declare global {
  interface Window {
    showCustomAlert: (message: string) => Promise<void>;
    showCustomConfirm: (message: string) => Promise<boolean>;
  }
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootLayout,
});

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScanOpen, setIsScanOpen] = React.useState(false);
  const [isCameraLoading, setIsCameraLoading] = React.useState(true);
  const [isMirrored, setIsMirrored] = React.useState(false);

  const showNavbar = [
    "/",
    "/anggota",
    "/anggota/",
    "/cari",
    "/cari/",
    "/pengaturan",
    "/pengaturan/",
  ].includes(location.pathname);

  const [dialog, setDialog] = React.useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    message: string;
    resolve: ((val: boolean | undefined) => void) | null;
  }>({
    isOpen: false,
    type: "alert",
    message: "",
    resolve: null,
  });

  React.useEffect(() => {
    window.showCustomAlert = (message: string) => {
      return new Promise<void>((resolve) => {
        setDialog({
          isOpen: true,
          type: "alert",
          message,
          resolve: () => {
            resolve();
            setDialog((prev) => ({ ...prev, isOpen: false }));
          },
        });
      });
    };

    window.showCustomConfirm = (message: string) => {
      return new Promise<boolean>((resolve) => {
        setDialog({
          isOpen: true,
          type: "confirm",
          message,
          resolve: (val) => {
            resolve(val ?? false);
            setDialog((prev) => ({ ...prev, isOpen: false }));
          },
        });
      });
    };
  }, []);

  // Effect to manage Html5Qrcode scanning inside the drawer
  React.useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isActive = true;

    if (isScanOpen) {
      setIsCameraLoading(true);
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      setIsMirrored(!isMobile);

      const startScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode("reader");
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.7;
                return { width: size, height: size };
              },
            },
            (decodedText) => {
              if (!isActive) return;
              html5QrCode
                ?.stop()
                .then(() => {
                  setIsScanOpen(false);
                  let qrCode = decodedText;
                  if (decodedText.includes("/anggota/")) {
                    const parts = decodedText.split("/anggota/");
                    if (parts.length > 1) {
                      const subParts = parts[1].split("/pengukuran/tambah");
                      qrCode = subParts[0];
                    }
                  }
                  navigate({
                    to: "/anggota/$id/pengukuran/tambah",
                    params: { id: qrCode },
                  });
                })
                .catch((e) => console.error("Error stopping scanner:", e));
            },
            () => {
              // verbose error callback
            },
          );

          if (!isActive) {
            html5QrCode
              .stop()
              .catch((e) =>
                console.error("Gagal stop camera pasca startup lambat:", e),
              );
            return;
          }

          setIsCameraLoading(false);
        } catch (err) {
          console.error("Gagal memulai scanner QR:", err);
          if (isActive) {
            setIsCameraLoading(false);
          }
        }
      };

      const timer = setTimeout(() => {
        startScanner();
      }, 300);

      return () => {
        isActive = false;
        clearTimeout(timer);
        if (html5QrCode?.isScanning) {
          html5QrCode
            .stop()
            .catch((e) => console.error("Gagal stop scanner on cleanup:", e));
        }
      };
    }
  }, [isScanOpen, navigate]);

  return (
    <div
      className={`flex flex-col min-h-screen w-full relative font-sans text-slate-800 bg-[#F8F9FA] ${showNavbar ? "pb-24" : ""}`}
    >
      <div className="flex-1 flex flex-col w-full">
        <Outlet />
      </div>

      {showNavbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/80 backdrop-blur-lg border border-slate-200/50 flex justify-around items-center py-2 px-3 z-10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <Link
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 w-16 [&.active]:text-slate-950 [&.active]:font-bold"
            to="/"
          >
            <Home className="w-5.5 h-5.5" />
            <span className="text-[9px] font-semibold">Beranda</span>
          </Link>

          <Link
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 w-16 [&.active]:text-slate-950 [&.active]:font-bold"
            to="/cari"
          >
            <Search className="w-5.5 h-5.5" />
            <span className="text-[9px] font-semibold">Cari</span>
          </Link>

          {/* Tombol Tengah (Scan QR) */}
          <button
            className="flex flex-col items-center justify-center -mt-6 bg-indigo-600 hover:bg-indigo-700 text-white w-13 h-13 rounded-full shadow-[0_4px_15px_rgba(79,70,229,0.35)] border-4 border-[#F8F9FA] transition-all cursor-pointer shrink-0 select-none"
            onClick={() => setIsScanOpen(true)}
            type="button"
          >
            <QrCode className="w-5.5 h-5.5 text-white" />
          </button>

          <Link
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 w-16 [&.active]:text-slate-950 [&.active]:font-bold"
            to="/anggota"
          >
            <Users className="w-5.5 h-5.5" />
            <span className="text-[9px] font-semibold">Anggota</span>
          </Link>

          <Link
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-900 w-16 [&.active]:text-slate-950 [&.active]:font-bold"
            to="/pengaturan"
          >
            <Settings className="w-5.5 h-5.5" />
            <span className="text-[9px] font-semibold">Pengaturan</span>
          </Link>
        </div>
      )}

      {/* Global QR Scanner Drawer */}
      <button
        aria-label="Tutup Scanner"
        className={`fixed inset-0 bg-black/60 z-[9990] transition-opacity duration-300 w-full border-none cursor-default ${isScanOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsScanOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setIsScanOpen(false)}
        type="button"
      />
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-[2.5rem] shadow-2xl z-[9995] px-6 pt-5 pb-8 transition-transform duration-300 ease-out transform ${isScanOpen ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none"}`}
      >
        {/* Handle bar drag indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-lg">
            Scan QR Code Anak
          </h3>
          <div className="flex items-center gap-2">
            {isScanOpen && (
              <button
                className={`p-1.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                  isMirrored
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setIsMirrored(!isMirrored)}
                title="Cerminkan Tampilan Kamera (Cermin)"
                type="button"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}
            <button
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              onClick={() => setIsScanOpen(false)}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner reader viewport */}
        {isScanOpen && (
          <div className="w-full h-[280px] overflow-hidden rounded-2xl border border-slate-100/60 bg-slate-50 shadow-inner my-2 relative flex items-center justify-center">
            <style>{`
              #reader video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                ${isMirrored ? "transform: scaleX(-1) !important;" : ""}
              }
            `}</style>
            {/* Loading Placeholder */}
            {isCameraLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold">
                  Memulai Kamera...
                </span>
              </div>
            )}
            <div className="w-full h-full" id="reader" />
          </div>
        )}

        <p className="text-[11px] text-slate-500 text-center font-medium mt-3 px-4 leading-relaxed">
          Posisikan QR Code anak di dalam kotak pemindai untuk langsung
          diarahkan ke form pengukuran.
        </p>
      </div>

      {/* Custom Alert/Confirm Modal Dialog */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border border-slate-100/50 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Icon based on type */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                dialog.type === "confirm"
                  ? "bg-amber-50 text-amber-500"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              {dialog.type === "confirm" ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>

            {/* Title & Message */}
            <div className="space-y-1">
              <h3 className="font-black text-slate-800 text-base leading-tight">
                {dialog.type === "confirm"
                  ? "Konfirmasi Tindakan"
                  : "Pemberitahuan"}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[260px] mx-auto">
                {dialog.message}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex w-full gap-3 pt-2">
              {dialog.type === "confirm" ? (
                <>
                  <button
                    className="flex-1 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    onClick={() => dialog.resolve?.(false)}
                    type="button"
                  >
                    Batal
                  </button>
                  <button
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => dialog.resolve?.(true)}
                    type="button"
                  >
                    Ya, Hapus
                  </button>
                </>
              ) : (
                <button
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => dialog.resolve?.(false)}
                  type="button"
                >
                  Mengerti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
