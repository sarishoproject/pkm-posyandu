import { NextResponse } from "@/lib/classes/server";
import { getConfig } from "@/lib/config";
import type { NextRouteHandler } from "@/types";

// GET /api/sensor — Proxy ke API sensor eksternal (timbangan & pengukur tinggi)
export const GET: NextRouteHandler = async () => {
  const config = getConfig();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      config.sensor.timeoutMs,
    );

    const baseUrl = config.sensor.apiBaseUrl.replace(/\/$/, "");
    const weightUrl = `${baseUrl}${config.sensor.weightEndpoint}`;
    const heightUrl = `${baseUrl}${config.sensor.heightEndpoint}`;

    const [weightRes, heightRes] = await Promise.all([
      fetch(weightUrl, { signal: controller.signal }),
      fetch(heightUrl, { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    // Cek HTTP status dari sensor
    if (!weightRes.ok || !heightRes.ok) {
      console.error("[API Sensor] Sensor HTTP error:", {
        weightStatus: weightRes.status,
        heightStatus: heightRes.status,
      });
      return NextResponse.json(
        {
          error:
            "Sensor merespons dengan error. Pastikan perangkat sensor aktif dan terhubung.",
        },
        { status: 502 },
      );
    }

    const weightData = await weightRes.json();
    const heightData = await heightRes.json();

    // Normalisasi: handle berbagai kemungkinan format respons
    const rawBerat = weightData.weight ?? weightData.value ?? weightData;
    const rawTinggi = heightData.height ?? heightData.value ?? heightData;

    const berat = Number(rawBerat);
    const tinggi = Number(rawTinggi);

    // Validasi: pastikan angka valid
    if (Number.isNaN(berat) || Number.isNaN(tinggi)) {
      console.error("[API Sensor] Invalid data format:", {
        weightData,
        heightData,
      });
      return NextResponse.json(
        {
          error:
            "Data dari sensor tidak valid. Format respons tidak sesuai yang diharapkan.",
        },
        { status: 502 },
      );
    }

    // Validasi: rentang wajar untuk bayi/anak
    if (berat <= 0 || berat > 200 || tinggi <= 0 || tinggi > 300) {
      console.error("[API Sensor] Data out of range:", { berat, tinggi });
      return NextResponse.json(
        {
          error:
            "Data sensor di luar rentang yang wajar. Periksa kalibrasi sensor.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      berat: berat.toFixed(1),
      tinggi: tinggi.toFixed(1),
    });
  } catch (error) {
    console.error("[API Sensor] Error:", error);

    if (error instanceof Error) {
      // Timeout
      if (error.name === "AbortError") {
        return NextResponse.json(
          {
            error: `Sensor tidak merespons dalam ${
              config.sensor.timeoutMs / 1000
            } detik. Pastikan sensor aktif dan terhubung ke jaringan yang sama.`,
          },
          { status: 504 },
        );
      }

      // Network error
      const msg = error.message.toLowerCase();
      if (
        msg.includes("fetch failed") ||
        msg.includes("econnrefused") ||
        msg.includes("enotfound") ||
        msg.includes("etimedout") ||
        msg.includes("connect")
      ) {
        return NextResponse.json(
          {
            error: `Tidak dapat terhubung ke server sensor (${config.sensor.apiBaseUrl}). Periksa URL di file config.yaml dan pastikan server sensor aktif.`,
          },
          { status: 502 },
        );
      }

      return NextResponse.json(
        { error: `Gagal menghubungi sensor: ${error.message}` },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan tidak terduga saat menghubungi sensor. Silakan coba lagi.",
      },
      { status: 500 },
    );
  }
};
