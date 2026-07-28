import * as ExcelJS from "exceljs";
import db from "@/db/connection";
import type { NextRouteHandler } from "@/types";

export const GET: NextRouteHandler = async () => {
  try {
    const data = db
      .query(`
      SELECT 
        p.nik, 
        p.nama_anak, 
        p.tanggal_lahir, 
        d.tanggal_ukur, 
        d.berat, 
        d.tinggi, 
        d.lila, 
        d.lingkar_kepala, 
        d.pitting_edema, 
        d.cara_ukur, 
        d.vita, 
        p.asi_bulan_0, 
        p.asi_bulan_1, 
        p.asi_bulan_2, 
        p.asi_bulan_3, 
        p.asi_bulan_4, 
        p.asi_bulan_5, 
        p.asi_bulan_6, 
        d.kelas_ibu_balita, 
        d.mbg
      FROM pendataan d
      JOIN peserta p ON d.peserta_id = p.id
      ORDER BY d.tanggal_ukur DESC
    `)
      .all() as any[];

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Erzy.sh WebDev";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Data Pengukuran", {
      views: [{ state: "frozen", xSplit: 2 }],
    });

    const columns = [
      { header: "No", key: "no", width: 6 },
      { header: "NIK", key: "nik", width: 22 },
      { header: "Nama Anak", key: "nama_anak", width: 28 },
      { header: "Tanggal Lahir", key: "tanggal_lahir", width: 16 },
      { header: "Tanggal Ukur", key: "tanggal_ukur", width: 16 },
      { header: "Berat Badan (kg)", key: "berat", width: 18 },
      { header: "Tinggi Badan (cm)", key: "tinggi", width: 18 },
      { header: "LILA (cm)", key: "lila", width: 12 },
      { header: "Lingkar Kepala (cm)", key: "lingkar_kepala", width: 20 },
      { header: "Pitting Edema", key: "pitting_edema", width: 16 },
      { header: "Cara Ukur", key: "cara_ukur", width: 14 },
      { header: "Vita", key: "vita", width: 12 },
      { header: "ASI 0 Bln", key: "asi_bulan_0", width: 12 },
      { header: "ASI 1 Bln", key: "asi_bulan_1", width: 12 },
      { header: "ASI 2 Bln", key: "asi_bulan_2", width: 12 },
      { header: "ASI 3 Bln", key: "asi_bulan_3", width: 12 },
      { header: "ASI 4 Bln", key: "asi_bulan_4", width: 12 },
      { header: "ASI 5 Bln", key: "asi_bulan_5", width: 12 },
      { header: "ASI 6 Bln", key: "asi_bulan_6", width: 12 },
      { header: "Kelas Ibu Balita", key: "kelas_ibu_balita", width: 18 },
      { header: "MBG", key: "mbg", width: 12 },
    ];

    sheet.columns = columns;

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = {
      bold: true,
      color: { argb: "FFFFFF" },
      name: "Arial",
      size: 10,
    };
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "3F51B5" }, // Indigo
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "D3D3D3" } },
        bottom: { style: "medium", color: { argb: "303F9F" } },
        left: { style: "thin", color: { argb: "D3D3D3" } },
        right: { style: "thin", color: { argb: "D3D3D3" } },
      };
    });

    data.forEach((row, index) => {
      const addedRow = sheet.addRow({
        no: index + 1,
        nik: row.nik,
        nama_anak: row.nama_anak,
        tanggal_lahir: row.tanggal_lahir,
        tanggal_ukur: row.tanggal_ukur,
        berat: row.berat,
        tinggi: row.tinggi,
        lila: row.lila,
        lingkar_kepala: row.lingkar_kepala,
        pitting_edema: row.pitting_edema,
        cara_ukur: row.cara_ukur,
        vita: row.vita,
        asi_bulan_0: row.asi_bulan_0,
        asi_bulan_1: row.asi_bulan_1,
        asi_bulan_2: row.asi_bulan_2,
        asi_bulan_3: row.asi_bulan_3,
        asi_bulan_4: row.asi_bulan_4,
        asi_bulan_5: row.asi_bulan_5,
        asi_bulan_6: row.asi_bulan_6,
        kelas_ibu_balita: row.kelas_ibu_balita,
        mbg: row.mbg,
      });

      // Align cells and add borders
      addedRow.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 9 };
        cell.border = {
          top: { style: "thin", color: { argb: "E0E0E0" } },
          bottom: { style: "thin", color: { argb: "E0E0E0" } },
          left: { style: "thin", color: { argb: "E0E0E0" } },
          right: { style: "thin", color: { argb: "E0E0E0" } },
        };
        if (colNumber === 1 || colNumber === 4 || colNumber === 5) {
          cell.alignment = { horizontal: "center" };
        } else if (colNumber >= 6 && colNumber <= 9) {
          cell.alignment = { horizontal: "right" };
        }
      });
    });

    const buffer = (await workbook.xlsx.writeBuffer()) as Buffer;

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="laporan_posyandu.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return new Response(
      JSON.stringify({ error: "Gagal mengekspor data ke Excel." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
