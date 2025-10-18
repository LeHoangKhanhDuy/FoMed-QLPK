import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:5006",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
