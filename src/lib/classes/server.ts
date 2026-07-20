import type { Context } from "hono";

/**
 * NextRequest — Wrapper type-safe untuk request Hono.
 *
 * Kelas ini membungkus context Hono (`Context`) dan menyediakan
 * akses ke `params`, `query`, dan `body JSON` dengan dukungan
 * generics TypeScript agar developer mendapatkan autocomplete
 * dan type-checking penuh saat menulis handler API.
 *
 * @template TParams - Tipe route params, mis. `{ id: string }`
 * @template TQuery  - Tipe query string, mis. `{ search: string; page: string }`
 * @template TBody   - Tipe body JSON, mis. `{ name: string; email: string }`
 *
 * @example
 * ```ts
 * export const GET: NextRouteHandler<{ id: string }> = async (req) => {
 *   const { id } = req.params; // type: string
 *   const user = db.query("SELECT * FROM users WHERE id = ?").get(id);
 *   return NextResponse.json(user);
 * };
 * ```
 */
export class NextRequest<
  TParams = Record<string, never>,
  TQuery = Record<string, never>,
  TBody = Record<string, never>,
> {
  /** Konteks Hono asli (hanya digunakan internal) */
  public ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  /**
   * Mengambil route parameter.
   * Untuk route `/users/:id` dengan URL `/users/42` → `{ id: "42" }`.
   */
  get params(): TParams {
    return this.ctx.req.param() as unknown as TParams;
  }

  /**
   * Mengambil query string.
   * Untuk URL `?search=budi&page=2` → `{ search: "budi", page: "2" }`.
   */
  get query(): TQuery {
    return this.ctx.req.query() as unknown as TQuery;
  }

  /**
   * Membaca dan mem-parsing body request sebagai JSON.
   * Wajib di-await.
   */
  async json(): Promise<TBody> {
    return (await this.ctx.req.json()) as TBody;
  }
}

/**
 * NextResponse — Wrapper type-safe untuk response HTTP.
 *
 * Mengikuti pola `NextResponse` dari Next.js API Routes agar
 * mudah diadopsi. Handler API mengembalikan instance ini, lalu
 * router (`src/app/api/index.ts`) menerjemahkannya menjadi
 * response Hono yang sesungguhnya.
 *
 * @template T - Tipe payload JSON yang akan dikembalikan
 *
 * @example
 * ```ts
 * return NextResponse.json(user, { status: 201 });
 * return NextResponse.json({ error: "Not found" }, { status: 404 });
 * ```
 */
export class NextResponse<T> {
  /** Payload JSON response */
  public data: T;
  /** HTTP status code (default: 200) */
  public status: number;
  /** HTTP headers tambahan */
  public headers: HeadersInit;

  constructor(data: T, init?: { status?: number; headers?: HeadersInit }) {
    this.data = data;
    this.status = init?.status || 200;
    this.headers = init?.headers || {};
  }

  /**
   * Factory method untuk membuat instance NextResponse.
   * Mengikuti pola `NextResponse.json()` dari Next.js.
   */
  static json<T>(data: T, init?: { status?: number; headers?: HeadersInit }) {
    return new NextResponse<T>(data, init);
  }
}

/**
 * NextRouteHandler — Tipe signature untuk handler route API.
 *
 * Mendefinisikan kontrak fungsi handler HTTP yang dipanggil oleh
 * router Hono. Handler menerima `NextRequest` dan mengembalikan
 * `NextResponse` (atau Promise-nya).
 *
 * @template TParams - Tipe route params
 * @template TQuery  - Tipe query string
 * @template TBody   - Tipe body JSON
 * @template TRes    - Tipe payload response
 *
 * @example
 * ```ts
 * export const POST: NextRouteHandler<{}, {}, { name: string }, User> = async (req) => {
 *   const { name } = await req.json();
 *   // ...
 * };
 * ```
 */
