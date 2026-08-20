import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Used only with `vite --mode local-test` and VITE_API_BASE_URL=/.
    // The browser stays same-origin with Vite while Vite securely proxies to
    // production; no local browser origin is added to production CORS.
    proxy: mode === "local-test"
      ? {
          "/api": {
            target: "https://api.printa.co.zm",
            changeOrigin: true,
            secure: true,
          },
        }
      : undefined,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["printa-logo-red.webp", "printa-logo-black.png", "printa-logo-white.png"],
      manifest: {
        name: "Printa Vendor Portal",
        short_name: "Printa Vendor",
        description: "Manage your Printa print business, stores, orders, and subscriptions.",
        theme_color: "#e71a1a",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/printa-logo-black.png",
            sizes: "500x500",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-font-styles" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-font-files",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
