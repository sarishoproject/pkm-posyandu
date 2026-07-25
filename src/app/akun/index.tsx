import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";

export const Route = createFileRoute("/akun/")({
  component: AkunPage,
});

function AkunPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] max-w-md mx-auto font-sans text-slate-800">
      <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
        <User className="w-10 h-10" />
      </div>
      <h1 className="text-xl font-bold text-slate-800">Halaman Akun</h1>
      <p className="text-sm text-slate-500 mt-2">
        Pengaturan akun belum tersedia.
      </p>
    </div>
  );
}
