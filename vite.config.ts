
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
  },
  build: {
    rollupOptions: {
      external: [
        // Add FullCalendar packages to external
        "@fullcalendar/core",
      ],
      output: {
        manualChunks: {
          // Core React dependencies
          'react-vendor': ['react', 'react-dom'],
          // UI components that are likely to be used across pages
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          // Admin pages group
          'admin-pages': [
            './src/pages/admin/Dashboard.tsx',
            './src/pages/admin/Employees.tsx',
            './src/pages/admin/Customers.tsx'
          ],
          // Auth related
          'auth-vendor': ['@supabase/supabase-js']
        }
      }
    }
  }
}));
