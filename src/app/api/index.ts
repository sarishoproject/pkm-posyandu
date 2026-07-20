import { type Context, Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { NextRequest } from "@/lib/classes/server";
import type { NextRouteHandler } from "@/types";

const app = new Hono();

app.onError((err, c) => {
  console.error(
    `[API] Unhandled error pada ${c.req.method} ${c.req.path}:`,
    err,
  );
  return c.json({ error: "Terjadi kesalahan internal pada server." }, 500);
});

const modules = import.meta.glob("./**/route.ts", { eager: true });

type RouteModule = Partial<
  Record<"GET" | "POST" | "PATCH" | "PUT" | "DELETE", NextRouteHandler>
>;

for (const path in modules) {
  const routeModule = modules[path] as RouteModule;

  let routePath = path.replace(/^\./, "").replace(/\/route\.ts$/, "") || "/";

  routePath = routePath
    .replace(/\[\.\.\.[^\]]+\]/g, "*")
    .replace(/\[([^\]]+)\]/g, ":$1");

  const fullPath = `/api${routePath === "/" ? "" : routePath}`;

  const wrapHandler = (handler: NextRouteHandler) => async (c: Context) => {
    try {
      const req = new NextRequest(c);
      const res = await handler(req);
      return c.json(
        res.data,
        res.status as ContentfulStatusCode,
        res.headers as Record<string, string | string[]>,
      );
    } catch (e) {
      console.error(
        `[API] Error pada handler ${c.req.method} ${c.req.path}:`,
        e,
      );
      const message =
        e instanceof Error ? e.message : "Kesalahan tidak diketahui.";
      return c.json({ error: message }, 500);
    }
  };

  // ✅ Use fullPath instead of routePath
  if (routeModule.GET) app.get(fullPath, wrapHandler(routeModule.GET));
  if (routeModule.POST) app.post(fullPath, wrapHandler(routeModule.POST));
  if (routeModule.PATCH) app.patch(fullPath, wrapHandler(routeModule.PATCH));
  if (routeModule.PUT) app.put(fullPath, wrapHandler(routeModule.PUT));
  if (routeModule.DELETE) app.delete(fullPath, wrapHandler(routeModule.DELETE));
}

export type AppType = typeof app;
export default app;
