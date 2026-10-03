import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};
export default defineConfig({
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
      "Content-Security-Policy":
        "default-src 'self'; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000; style-src 'self'; img-src 'self' data:; font-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    },
  },
  build: { target: "es2022", sourcemap: false },
});
