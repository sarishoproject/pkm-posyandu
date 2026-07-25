import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
      <h1 className="text-4xl font-bold font-title">Welcome to Eryzsh</h1>
      <p className="text-secondary mt-4">
        Fullstack Vite + React + Hono + Bun ....
      </p>
    </div>
  ),
});
