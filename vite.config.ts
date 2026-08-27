
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure a single React copy so hooks share one dispatcher
    dedupe: ["react", "react-dom", "react-router-dom"],
  },
  optimizeDeps: {
    // Optimize every React runtime entry in the same pass. If Vite discovers
    // one later, it can replace the React chunk while the page still holds the
    // previous dispatcher, which produces a null `dispatcher.useMemo`.
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "@tanstack/react-query",
    ],
    force: true,
  },
  build: {
    cssCodeSplit: true, // Enable CSS code splitting to reduce render blocking
  }
}));
