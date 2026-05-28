import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Assuming your local worker runs on 8787. Change if needed.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (['react', 'react-dom', 'react-router-dom'].some(pkg => id.includes(`node_modules/${pkg}/`))) {
              return 'vendor';
            }
            if (['lucide-react', 'recharts', 'embla-carousel-react'].some(pkg => id.includes(`node_modules/${pkg}/`))) {
              return 'ui';
            }
          }
        }
      }
    }
  }
});
