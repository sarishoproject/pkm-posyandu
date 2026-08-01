import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// ─── Types ───────────────────────────────────────────────────────────
interface SensorConfig {
  apiBaseUrl: string;
  heightEndpoint: string;
  timeoutMs: number;
  weightEndpoint: string;
}

interface AppConfig {
  sensor: SensorConfig;
}

// ─── Defaults ────────────────────────────────────────────────────────
const DEFAULT_CONFIG: AppConfig = {
  sensor: {
    apiBaseUrl: "https://mock.fadlanabduh.my.id",
    weightEndpoint: "/api/weight",
    heightEndpoint: "/api/height",
    timeoutMs: 5000,
  },
};

const CONFIG_FILENAME = "config.yaml";

const DEFAULT_CONFIG_CONTENT = `# ============================================================
# KONFIGURASI APLIKASI PKM POSYANDU
# ============================================================
# File ini dibuat otomatis saat aplikasi pertama kali dijalankan.
# Anda bisa mengubah nilai-nilai di bawah ini sesuai kebutuhan.
# Setelah mengubah, RESTART aplikasi agar perubahan berlaku.
# ============================================================

# --- Pengaturan Sensor ---
# URL server API sensor untuk timbangan dan pengukur tinggi
sensor:
  # URL dasar server sensor
  # Ganti ini jika server sensor berpindah alamat
  apiBaseUrl: "https://mock.fadlanabduh.my.id"

  # Endpoint untuk membaca berat badan (dalam kg)
  weightEndpoint: "/api/weight"

  # Endpoint untuk membaca tinggi badan (dalam cm)
  heightEndpoint: "/api/height"

  # Waktu tunggu maksimal dalam milidetik (5000 = 5 detik)
  # Jika sensor tidak merespons dalam waktu ini, akan muncul pesan error
  timeoutMs: 5000
`;

// ─── Path Resolution ─────────────────────────────────────────────────
function findExistingConfig(): string | null {
  // 1. Environment variable override
  if (process.env.CONFIG_PATH && existsSync(process.env.CONFIG_PATH)) {
    return resolve(process.env.CONFIG_PATH);
  }

  // 2. Current working directory (paling umum: project root atau binary dir)
  const cwdPath = resolve(process.cwd(), CONFIG_FILENAME);
  if (existsSync(cwdPath)) return cwdPath;

  // 3. Directory executable (untuk binary yang dijalankan langsung)
  const exeDir = resolve(dirname(process.execPath), CONFIG_FILENAME);
  if (existsSync(exeDir)) return exeDir;

  return null;
}

function getDefaultConfigPath(): string {
  if (process.env.CONFIG_PATH) {
    return resolve(process.env.CONFIG_PATH);
  }
  return resolve(process.cwd(), CONFIG_FILENAME);
}

// ─── Parsing & Validation ───────────────────────────────────────────
function validateConfig(parsed: unknown): AppConfig {
  const p = (parsed ?? {}) as Partial<AppConfig>;
  const s =
    p.sensor ??
    ({} as {
      apiBaseUrl: string;
      weightEndpoint: string;
      heightEndpoint: string;
      timeoutMs: string;
    });

  return {
    sensor: {
      apiBaseUrl:
        typeof s.apiBaseUrl === "string" && s.apiBaseUrl.trim().length > 0
          ? s.apiBaseUrl.trim()
          : DEFAULT_CONFIG.sensor.apiBaseUrl,
      weightEndpoint:
        typeof s.weightEndpoint === "string" &&
        s.weightEndpoint.trim().length > 0
          ? s.weightEndpoint.trim()
          : DEFAULT_CONFIG.sensor.weightEndpoint,
      heightEndpoint:
        typeof s.heightEndpoint === "string" &&
        s.heightEndpoint.trim().length > 0
          ? s.heightEndpoint.trim()
          : DEFAULT_CONFIG.sensor.heightEndpoint,
      timeoutMs:
        typeof s.timeoutMs === "number" && s.timeoutMs > 0
          ? s.timeoutMs
          : DEFAULT_CONFIG.sensor.timeoutMs,
    },
  };
}

function parseConfigFile(filePath: string): AppConfig {
  const content = readFileSync(filePath, "utf-8");
  const raw = Bun.YAML.parse(content);
  return validateConfig(raw);
}

function generateDefaultConfig(filePath: string): AppConfig {
  try {
    writeFileSync(filePath, DEFAULT_CONFIG_CONTENT, "utf-8");
    console.log(`[Config] File konfigurasi dibuat di: ${filePath}`);
  } catch (e) {
    console.error(`[Config] Gagal membuat file konfigurasi di ${filePath}:`, e);
  }
  return DEFAULT_CONFIG;
}

// ─── Public API ──────────────────────────────────────────────────────
let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const existingPath = findExistingConfig();

  if (existingPath) {
    try {
      cachedConfig = parseConfigFile(existingPath);
      console.log(`[Config] Memuat konfigurasi dari: ${existingPath}`);
      return cachedConfig;
    } catch (e) {
      console.error(
        `[Config] Gagal parse ${existingPath}, menggunakan default:`,
        e,
      );
      cachedConfig = DEFAULT_CONFIG;
      return cachedConfig;
    }
  }

  // File belum ada → generate
  const newPath = getDefaultConfigPath();
  cachedConfig = generateDefaultConfig(newPath);
  return cachedConfig;
}

export function reloadConfig(): AppConfig {
  cachedConfig = null;
  return getConfig();
}

export type { AppConfig, SensorConfig };
