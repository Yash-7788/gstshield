import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};
export default defineConfig(({ mode }) => {
  const configured = loadEnv(mode, process.cwd(), "VITE_").VITE_API_BASE_URL;
  const target = new URL(configured || "http://localhost:8000");
  if (
    target.protocol !== "http:" ||
    !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) ||
    !["", "/"].includes(target.pathname) ||
    target.username ||
    target.password ||
    target.search ||
    target.hash
  )
    throw new Error("Configure a plain local HTTP API origin.");
  return {
    plugins: [react()],
    server: {
      host: "127.0.0.1",
      port: 3000,
      strictPort: true,
      allowedHosts: ["localhost", "127.0.0.1"],
      headers,
    },
    preview: {
      host: "127.0.0.1",
      port: 3000,
      strictPort: true,
      headers: {
        ...headers,
        "Content-Security-Policy": `default-src 'self'; connect-src 'self' ${target.origin} http://localhost:8000 http://127.0.0.1:8000; style-src 'self'; img-src 'self' data:; font-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`,
      },
    },
    build: { target: "es2022", sourcemap: false },
  };
});
