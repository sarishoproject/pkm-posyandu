import { NextResponse } from "@/lib/classes/server";
import { getConfig } from "@/lib/config";
import type { NextRouteHandler } from "@/types";

// GET /api/sensor?sensorType=bb | tb
export const GET: NextRouteHandler<
  Record<string, never>,
  { sensorType?: string }
> = async (req) => {
  const config = getConfig();
  const { sensorType } = req.query;

  if (!sensorType || (sensorType !== "bb" && sensorType !== "tb")) {
    return NextResponse.json(
      {
        error:
          "Parameter 'sensorType' wajib diisi dengan nilai 'bb' (Berat Badan) atau 'tb' (Tinggi Badan).",
      },
      { status: 400 },
    );
  }

  const isWeight = sensorType === "bb";
  const endpoint = isWeight
    ? config.sensor.weightEndpoint
    : config.sensor.heightEndpoint;
  const baseUrl = config.sensor.apiBaseUrl.replace(/\/$/, "");
  const targetUrl = `${baseUrl}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      config.sensor.timeoutMs,
    );

    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        `[API Sensor] HTTP error for ${sensorType}:`,
        response.status,
      );
      return NextResponse.json(
        {
          error: `Sensor ${
            isWeight ? "berat badan" : "tinggi badan"
          } merespons dengan error. Pastikan perangkat sensor aktif.`,
        },
        { status: 502 },
      );
    }

    const data = await response.json();

    const rawValue = isWeight
      ? (data.weight ?? data.value ?? data)
      : (data.height ?? data.value ?? data);

    const value = Number(rawValue);

    if (Number.isNaN(value)) {
      console.error(
        `[API Sensor] Invalid data format for ${sensorType}:`,
        data,
      );
      return NextResponse.json(
        {
          error: `Data dari sensor ${
            isWeight ? "berat badan" : "tinggi badan"
          } tidak valid. Format respons tidak sesuai.`,
        },
        { status: 502 },
      );
    }

    // Validasi rentang wajar
    if (isWeight && (value <= 0 || value > 200)) {
      console.error("[API Sensor] Weight out of range:", value);
      return NextResponse.json(
        {
          error:
            "Data berat badan di luar rentang yang wajar. Periksa kalibrasi sensor.",
        },
        { status: 422 },
      );
    }

    if (!isWeight && (value <= 0 || value > 300)) {
      console.error("[API Sensor] Height out of range:", value);
      return NextResponse.json(
        {
          error:
            "Data tinggi badan di luar rentang yang wajar. Periksa kalibrasi sensor.",
        },
        { status: 422 },
      );
    }

    if (isWeight) {
      return NextResponse.json({ berat: value.toFixed(1) });
    }
    return NextResponse.json({ tinggi: value.toFixed(1) });
  } catch (error) {
    console.error(`[API Sensor] Error for ${sensorType}:`, error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          {
            error: `Sensor tidak merespons dalam ${
              config.sensor.timeoutMs / 1000
            } detik. Pastikan sensor aktif.`,
          },
          { status: 504 },
        );
      }

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
            error:
              "Tidak dapat terhubung ke server sensor. Periksa URL di file config.yaml dan pastikan server sensor aktif.",
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
