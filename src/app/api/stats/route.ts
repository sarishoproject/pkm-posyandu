import db from "@/db/connection";
import { NextResponse } from "@/lib/classes/server";
import type { NextRouteHandler } from "@/types";

export const GET: NextRouteHandler<
  Record<string, never>,
  { month?: string }
> = async (req) => {
  // Check for 'month' query parameter, e.g. "?month=2026-06"
  const { month: paramMonth } = req.query;

  const now = new Date();
  const currentYearMonth = paramMonth && /^\d{4}-\d{2}$/.test(paramMonth)
    ? paramMonth
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    // 1. Total participants
    const totalPesertaObj = db.query("SELECT COUNT(*) as count FROM peserta").get() as { count: number };
    const totalPeserta = totalPesertaObj?.count || 0;

    // 2. Total measurements (examinations)
    const totalPemeriksaanObj = db.query("SELECT COUNT(*) as count FROM pendataan").get() as { count: number };
    const totalPemeriksaan = totalPemeriksaanObj?.count || 0;

    // 3. Examined this month
    const sudahPeriksaObj = db.query(`
      SELECT COUNT(DISTINCT peserta_id) as count 
      FROM pendataan 
      WHERE strftime('%Y-%m', tanggal_ukur) = ?
    `).get(currentYearMonth) as { count: number };
    const sudahPeriksa = sudahPeriksaObj?.count || 0;

    // 4. Not examined this month
    const belumPeriksaObj = db.query(`
      SELECT COUNT(*) as count 
      FROM peserta 
      WHERE id NOT IN (
        SELECT DISTINCT peserta_id 
        FROM pendataan 
        WHERE strftime('%Y-%m', tanggal_ukur) = ?
      )
    `).get(currentYearMonth) as { count: number };
    const belumPeriksa = belumPeriksaObj?.count || 0;

    // 5. Monthly trend for chart
    const trenBulanan = db.query(`
      SELECT strftime('%Y-%m', tanggal_ukur) as bulan, COUNT(*) as jumlah 
      FROM pendataan 
      WHERE tanggal_ukur IS NOT NULL AND tanggal_ukur != '' AND tanggal_ukur != 'null'
      GROUP BY bulan 
      ORDER BY bulan ASC
    `).all() as { bulan: string; jumlah: number }[];

    // 6. Monthly averages for TradingView charts
    const rataRataPertumbuhan = db.query(`
      SELECT 
        strftime('%Y-%m', tanggal_ukur) as bulan, 
        ROUND(AVG(berat), 1) as rata_berat, 
        ROUND(AVG(tinggi), 1) as rata_tinggi 
      FROM pendataan 
      WHERE tanggal_ukur IS NOT NULL AND tanggal_ukur != '' AND tanggal_ukur != 'null'
      GROUP BY bulan 
      ORDER BY bulan ASC
    `).all() as { bulan: string; rata_berat: number; rata_tinggi: number }[];

    // Format monthly names for Indonesian locale
    const formattedTren = trenBulanan
      .filter((item) => item.bulan && item.bulan.includes("-"))
      .map((item) => {
        const [year, month] = item.bulan.split("-");
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 15);
        const labelBulan = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        return {
          bulan: labelBulan,
          jumlah: item.jumlah,
        };
      });

    const formattedRataRata = rataRataPertumbuhan
      .filter((item) => item.bulan && item.bulan.includes("-"))
      .map((item) => {
        const [year, month] = item.bulan.split("-");
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 15);
        const labelBulan = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        return {
          bulan: labelBulan,
          rata_berat: item.rata_berat,
          rata_tinggi: item.rata_tinggi,
        };
      });

    // 7. Individual examination details for this month
    const pemeriksaanBulanIni = db.query(`
      SELECT 
        p.id, 
        p.nama_anak, 
        d.berat, 
        d.tinggi 
      FROM pendataan d
      JOIN peserta p ON d.peserta_id = p.id
      WHERE strftime('%Y-%m', d.tanggal_ukur) = ?
    `).all(currentYearMonth) as { id: number; nama_anak: string; berat: number; tinggi: number }[];

    // Extract first name for shorter labels in chart badges
    const formattedPemeriksaanBulanIni = pemeriksaanBulanIni.map((item) => {
      const namaPanggilan = item.nama_anak.trim().split(" ")[0];
      return {
        id: item.id,
        nama_panggilan: namaPanggilan,
        berat: item.berat,
        tinggi: item.tinggi,
      };
    });

    return NextResponse.json({
      total_peserta: totalPeserta,
      total_pemeriksaan: totalPemeriksaan,
      sudah_periksa_bulan_ini: sudahPeriksa,
      belum_periksa_bulan_ini: belumPeriksa,
      tren_bulanan: formattedTren,
      rata_rata_pertumbuhan: formattedRataRata,
      pemeriksaan_bulan_ini: formattedPemeriksaanBulanIni,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data statistik." },
      { status: 500 },
    );
  }
};
