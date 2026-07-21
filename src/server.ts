import * as fs from "node:fs";
import * as path from "node:path";
import app from "./app/api/index";

// ─── ANSI Color Helpers (Native Bun) ────────────────────────────────
const color = (c: string, t: string) => {
  const ansi = Bun.color(c, "ansi");
  return ansi ? `${ansi}${t}\x1b[0m` : t;
};
const C = {
  green: (t: string) => color("green", t),
  red: (t: string) => color("red", t),
  yellow: (t: string) => color("yellow", t),
  cyan: (t: string) => color("cyan", t),
  gray: (t: string) => color("gray", t),
  blue: (t: string) => color("blue", t),
  magenta: (t: string) => color("magenta", t),
  bold: (t: string) => `\x1b[1m${t}\x1b[0m`,
};

// ─── Embedded Assets Type ───────────────────────────────────────────
type EmbeddedAsset = {
  content: string;
  mime: string;
  isText: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __EMBEDDED_ASSETS__: Record<string, EmbeddedAsset> | undefined;
}

const _embedded = globalThis.__EMBEDDED_ASSETS__;

// ─── Shell Helper (Tanpa import "bun" agar Vite SSR tidak error) ────
function runCmd(cmd: string[]) {
  const proc = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" });
  if (proc.exitCode !== 0) {
    const err = new TextDecoder().decode(proc.stderr);
    throw new Error(`Command failed: ${cmd.join(" ")}\n${err}`);
  }
  return new TextDecoder().decode(proc.stdout).trim();
}

// ═══════════════════════════════════════════════════════════════════
// CLI Argument Handler
// ═══════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);

if (args.includes("setup")) {
  setupSystemd();
} else {
  startServer();
}

// ═══════════════════════════════════════════════════════════════════
// Setup Mode: Auto-configure Systemd & Log Management
// ═══════════════════════════════════════════════════════════════════
function setupSystemd() {
  console.log(C.bold(C.cyan("PKM Posyandu - Auto Setup")));
  console.log(C.gray("---------------------------------"));

  if (process.platform !== "linux") {
    console.error(
      C.red("Error: ") +
        "Setup hanya dapat dijalankan di Linux (Raspberry Pi).",
    );
    process.exit(1);
  }

  if (process.getuid && process.getuid() !== 0) {
    console.error(
      `${C.red("Error: ")}Setup membutuhkan akses root. Jalankan dengan:`,
    );
    console.error(C.gray(`  sudo ${process.execPath} setup`));
    process.exit(1);
  }

  const execPath = process.execPath;
  const workingDir = path.dirname(execPath);
  const serviceName = "posyandu";
  const servicePath = `/etc/systemd/system/${serviceName}.service`;
  const dbPath = `${workingDir}/data/data.db`;

  console.log(
    `${C.cyan("[1/4] ")}Membuat file service: ${C.gray(servicePath)}`,
  );

  const serviceContent = `[Unit]
Description=PKM Posyandu Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${workingDir}
ExecStart=${execPath}
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=DB_PATH=${dbPath}
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=${serviceName}

[Install]
WantedBy=multi-user.target`;

  try {
    fs.writeFileSync(servicePath, serviceContent, { mode: 0o644 });
    console.log(`${C.green("  [OK] ")}File service berhasil dibuat.`);
  } catch (e) {
    console.error(`${C.red("  [FAIL] ")}Gagal membuat file service:`, e);
    process.exit(1);
  }

  try {
    console.log(`${C.cyan("[2/4] ")}Reload systemd daemon...`);
    runCmd(["systemctl", "daemon-reload"]);
    console.log(`${C.green("  [OK] ")}Daemon reloaded.`);

    console.log(
      `${C.cyan("[3/4] ")}Enable service untuk auto-start saat boot...`,
    );
    runCmd(["systemctl", "enable", serviceName]);
    console.log(`${C.green("  [OK] ")}Auto-start enabled.`);

    console.log(`${C.cyan("[4/4] ")}Memulai service...`);
    runCmd(["systemctl", "restart", serviceName]);
    console.log(`${C.green("  [OK] ")}Service dimulai.`);

    console.log("");
    console.log(C.bold(C.green("Setup Selesai!")));
    console.log(C.gray("---------------------------------"));
    console.log(
      `Aplikasi berjalan di: ${C.cyan("http://<ip-raspberry-pi>:3000")}`,
    );
    console.log("");
    console.log(C.bold("Perintah berguna:"));
    console.log(
      `  Cek status  : ${C.gray(`sudo systemctl status ${serviceName}`)}`,
    );
    console.log(
      `  Cek log     : ${C.gray(`sudo journalctl -u ${serviceName} -f`)}`,
    );
    console.log(
      `  Stop app    : ${C.gray(`sudo systemctl stop ${serviceName}`)}`,
    );
    console.log(
      `  Start app   : ${C.gray(`sudo systemctl start ${serviceName}`)}`,
    );
    console.log("");
    process.exit(0);
  } catch (e) {
    console.error(`${C.red("  [FAIL] ")}Gagal mengkonfigurasi systemd:`, e);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════
// Server Mode: Start HTTP Server
// ═══════════════════════════════════════════════════════════════════
function startServer() {
  // Network Traffic Logger Middleware
  app.use("*", async (c, next) => {
    const start = Bun.nanoseconds();
    await next();
    const duration = (Bun.nanoseconds() - start) / 1_000_000;
    const method = c.req.method;
    const reqPath = c.req.path;
    const status = c.res.status;

    const statusStr =
      status >= 500
        ? C.red(status.toString())
        : status >= 400
          ? C.yellow(status.toString())
          : C.green(status.toString());
    const methodStr =
      method === "GET"
        ? C.blue(method.padEnd(6))
        : method === "POST"
          ? C.green(method.padEnd(6))
          : method === "DELETE"
            ? C.red(method.padEnd(6))
            : C.yellow(method.padEnd(6));

    console.log(
      `${C.gray(new Date().toISOString())} ${methodStr} ${reqPath} ${statusStr} ${C.gray(`${duration.toFixed(2)}ms`)}`,
    );
  });

  if (_embedded) {
    app.use("/*", async (c, next) => {
      if (c.req.path.startsWith("/api")) return next();

      const urlPath = c.req.path === "/" ? "/index.html" : c.req.path;
      const asset = _embedded[urlPath.replace(/^\//, "")];

      if (asset) {
        const headers: Record<string, string> = {
          "Content-Type": asset.mime,
          "Cache-Control": "public, max-age=31536000, immutable",
        };

        if (asset.isText) {
          return new Response(asset.content, { headers });
        }

        const file = Bun.file(asset.content);
        return new Response(file, { headers });
      }

      return next();
    });

    app.notFound(async (c) => {
      const indexAsset = _embedded["index.html"];
      if (indexAsset) return c.html(indexAsset.content);
      return c.text("Not Found", 404);
    });
  } else {
    const frontendDistPath = path.join(
      path.dirname(process.execPath),
      "dist/client",
    );

    app.use("/*", async (c, next) => {
      if (c.req.path.startsWith("/api")) return next();

      const urlPath = c.req.path === "/" ? "/index.html" : c.req.path;
      const filePath = path.join(frontendDistPath, urlPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return new Response(Bun.file(filePath));
      }

      return next();
    });

    app.notFound(async (c) => {
      const indexPath = path.join(frontendDistPath, "index.html");
      if (fs.existsSync(indexPath)) {
        return c.html(fs.readFileSync(indexPath, "utf-8"));
      }
      return c.text("Not Found", 404);
    });
  }

  const port = Number(process.env.PORT) || 3000;
  const startTime = Date.now();

  console.log("");
  console.log(C.bold(C.green("PKM Posyandu Server Running")));
  console.log(C.gray("---------------------------------"));
  console.log(`  Local:    ${C.cyan(`http://localhost:${port}`)}`);
  console.log(`  Network:  ${C.cyan(`http://<ip-address>:${port}`)}`);
  console.log(
    `  Mode:     ${_embedded ? C.yellow("Embedded Binary") : C.yellow("Filesystem Dev")}`,
  );
  console.log(C.gray("---------------------------------"));
  console.log("");

  // Periodic Stats Logger (Memory & Uptime)
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const rssMB = (memUsage.rss / 1024 / 1024).toFixed(2);
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptimeSec / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const secs = uptimeSec % 60;

    console.log(
      `${C.gray(new Date().toISOString())} ${C.magenta("[STATS]")} Memory: ${C.cyan(`${rssMB} MB`)} | Uptime: ${C.cyan(`${hours}h ${mins}m ${secs}s`)}`,
    );
  }, 60000); // Cetak stats setiap 1 menit

  Bun.serve({
    port,
    fetch: app.fetch,
  });
}
