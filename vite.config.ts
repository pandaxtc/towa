import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), svgr()],
    define: {
      process: {
        env: {
          NODE_ENV: mode,
        },
      },
    },
    esbuild: {
      drop: (mode === "production") ?  ["console"] : undefined,
    },
  };
});
