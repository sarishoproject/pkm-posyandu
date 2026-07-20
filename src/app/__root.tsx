import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React from "react";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <React.Fragment>
      <Outlet />
      {/* 
        ReactQueryDevtools and TanStackRouterDevtools can be added here
        if you want them in dev mode.
      */}
    </React.Fragment>
  ),
});
