import * as path from "node:path";
import honoDevServer from "@hono/vite-dev-server";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    honoDevServer({
      entry: "src/app/api/index.ts",
      injectClientScript: false,
      exclude: [
        /^\/@.*/,
        /^\/src\/.*/,
        /^\/node_modules\/.*/,
        /^\/__vite.*/,
        /^\/favicon\..*/,
        /^\/fonts\/.*/,
        /^\/public\/.*/,
        /.*\.(js|ts|tsx|jsx|css|html|svg|png|ico|woff|woff2|ttf|eot)$/,
        /^\/$/,
        /^(?!\/api\/).*/,
      ],
    }),
    tanstackRouter({
      routesDirectory: "src/app",
      generatedRouteTree: "src/routeTree.gen.ts",
      routeFileIgnorePattern: "(index|types|route)\\.ts$",
    }),
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tambahkan konfigurasi SSR ini:
  ssr: {
    external: ["bun:sqlite", "bun"],
  },
});
