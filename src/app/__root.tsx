import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Home,
  Search,
  Settings,
  Users,
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
  const showNavbar = [
    "/",
    "/anggota",
    "/anggota/",
    "/cari",
    "/cari/",
    "/akun",
    "/akun/",
  ].includes(location.pathname);

  const [dialog, setDialog] = React.useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    message: string;
    resolve: ((val: unknown) => void) | null;
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
          resolve: (val: boolean) => {
            resolve(val);
            setDialog((prev) => ({ ...prev, isOpen: false }));
          },
        });
      });
    };
  }, []);

  return (
    <div
      className={`flex flex-col min-h-screen w-full relative font-sans text-slate-800 bg-[#F8F9FA] ${showNavbar ? "pb-24" : ""}`}
    >
      <div className="flex-1 flex flex-col w-full">
        <Outlet />
      </div>

      {showNavbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 backdrop-blur-lg border border-slate-200/50 flex justify-around py-3 px-4 z-10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <Link
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-20 [&.active]:text-indigo-700"
            to="/"
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Beranda</span>
          </Link>

          <Link
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-16 [&.active]:text-indigo-700"
            to="/cari"
          >
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-medium">Cari</span>
          </Link>

          <Link
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-16 [&.active]:text-indigo-700"
            to="/anggota"
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">Anggota</span>
          </Link>

          <Link
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-indigo-700 w-16 [&.active]:text-indigo-700"
            to="/akun"
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Setelan</span>
          </Link>
        </div>
      )}

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
                  onClick={() => dialog.resolve?.(null)}
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
