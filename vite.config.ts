
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin to defer CSS loading for better performance
function deferCssPlugin() {
  return {
    name: 'defer-css',
    transformIndexHtml(html: string) {
      // Transform CSS links to load asynchronously
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+\.css)"/g,
        '<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel=\'stylesheet\'" /><noscript><link rel="stylesheet" href="$1" /></noscript>'
      );
    }
  };
}

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
    mode === 'production' && deferCssPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: false, // Single CSS file for faster initial load
    minify: mode === 'production' ? 'terser' : 'esbuild',
    ...(mode === 'production' && {
      terserOptions: {
        compress: {
          drop_console: true,
          passes: 2
        }
      }
    }),
    rollupOptions: {
      external: [
        "@fullcalendar/core",
      ],
      output: {
        manualChunks: (id) => {
          // More aggressive chunking for critical path optimization
          if (id.includes('node_modules')) {
            // Critical: React must load first
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            // UI components in separate chunk to avoid blocking
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Auth can be lazy loaded
            if (id.includes('@supabase')) {
              return 'auth-vendor';
            }
            // Everything else
            return 'vendor';
          }
          // Separate admin pages for code splitting
          if (id.includes('/pages/admin/')) {
            return 'admin-pages';
          }
        }
      }
    }
  }
}));
