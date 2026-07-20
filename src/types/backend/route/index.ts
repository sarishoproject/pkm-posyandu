import type { NextRequest, NextResponse } from "@/lib/classes/server";

export type NextRouteHandler<
  TParams = Record<string, never>,
  TQuery = Record<string, never>,
  TBody = Record<string, never>,
  TRes = unknown,
> = (
  req: NextRequest<TParams, TQuery, TBody>,
) => Promise<NextResponse<TRes>> | NextResponse<TRes>;
