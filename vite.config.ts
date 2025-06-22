import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueDevTools from "vite-plugin-vue-devtools";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "node:path";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";

import { viteMockServe } from "vite-plugin-mock";

// https://vitejs.dev/config/
const pathSrc = fileURLToPath(new URL("./src", import.meta.url));

export default ({ mode }: { mode: string }) => {
  const VITE_APP_BASE_API: string = loadEnv(mode, process.cwd()).VITE_APP_BASE_API;
  return defineConfig({
    // base: "/ui/",
    base: "./",
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ["ep"],
          }),
        ],
        dts: path.resolve(pathSrc, "components.d.ts"),
      }),
      Icons({
        autoInstall: true,
      }),
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
          // 自动导入图标组件
          IconsResolver({
            prefix: "Icon",
          }),
        ],
        dts: path.resolve(pathSrc, "auto-imports.d.ts"),
      }),
      basicSsl(),
      vueDevTools(),
      viteMockServe({
        mockPath: "mock",
        enable: true,
        logger: true, // 打印请求日志（调试用）
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          additionalData: `@use "@/assets/theme/var.scss" as *;`,
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: `https://${VITE_APP_BASE_API}/`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "ui",
    },
    test: {
      // 启用类似 jest 的全局测试 API
      globals: true,
      // 使用 happy-dom 模拟 DOM
      // 这需要你安装 happy-dom 作为对等依赖（peer dependency）
      environment: "happy-dom",
      deps: {
        inline: ["element-plus"],
      },
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov", "html"],
        reportsDirectory: "./coverage",
        enabled: true,
      },
    },
  });
};
