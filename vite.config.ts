import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const isGithub = process.env.VITE_BUILD_TARGET === "github";

export default defineConfig({
  plugins: [react()],
  base: isGithub ? "/shswassce/" : "./", // Use /shswassce/ for GitHub Pages, ./ for Capacitor
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
