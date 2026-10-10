import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { exportFolder } from "./vite-export";

export default defineConfig({
  plugins: [react(), exportFolder()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    // 내보낸 결과물이 바뀌어도 미리보기가 다시 불러오지 않게 한다.
    watch: { ignored: ["**/courses/*/export/**"] },
  },
});
