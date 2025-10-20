// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); 
  const target = env.VITE_API_BASE_URL || "http://localhost:5006"; 

  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: { exclude: ["lucide-react"] },
    server: {
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: target.startsWith("https"), 
        },
      },
    },
  };
});
