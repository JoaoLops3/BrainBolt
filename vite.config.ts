import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Otimizações de bundle
    target: "esnext",
    minify: "terser",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunks para melhor code splitting
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
          ],
          "supabase-vendor": ["@supabase/supabase-js"],
          "query-vendor": ["@tanstack/react-query"],

          // Feature chunks
          "game-components": [
            "./src/components/game/BrainBoltGame.tsx",
            "./src/components/game/MultiplayerGame.tsx",
            "./src/components/game/OptimizedMultiplayerGame.tsx",
          ],
          "classroom-components": [
            "./src/components/classroom/TeacherDashboard.tsx",
            "./src/components/classroom/StudentDashboard.tsx",
          ],
        },
        // Nome dos chunks para melhor cache
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop()
            : "chunk";
          return `assets/js/${chunkInfo.name}-[hash].js`;
        },
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Terser options para minificação
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
    ],
    exclude: ["@capacitor/core", "@capacitor/cli"],
  },
}));
