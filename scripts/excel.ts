import * as ExcelJS from "exceljs";

const workbook = new ExcelJS.Workbook();
workbook.creator = "Erzy.sh WebDev";
workbook.lastModifiedBy = "Sarisho";
workbook.created = new Date();
workbook.modified = new Date();

const sheet = workbook.addWorksheet("Data Pengukuran", {
  views: [{ state: "frozen", xSplit: 1 }],
});

const collumns = [
  "No",
  "NIK",
  "Nama Anak",
  "Tanggal Lahir",
  "Tanggal Ukur",
  "Berat Badan",
  "Tinggi Badan",
  "LILA",
  "Lingkar Kepala",
  "Pitting edema",
  "Cara Ukur",
  "vita",
  "asi_bulan_0",
  "asi_bulan_1",
  "asi_bulan_2",
  "asi_bulan_3",
  "asi_bulan_4",
  "asi_bulan_5",
  "asi_bulan_6",
  "kelas_ibu_balita",
  "mbg",
];

sheet.columns = collumns.map((subject) => {
  return {
    header: subject,
    key: subject.toLowerCase(),
    style: {
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF00" } },
    },
  };
});

await workbook.xlsx.writeFile("itulah.xlsx");
