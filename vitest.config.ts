import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig({ mode: "test" }),
  defineConfig({
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      coverage: {
        exclude: ["**/*.config.{ts,js}", "**/*.cjs", "**/*.d.ts", "ui/**/*", "src/{main.ts,App.vue}", "src/lib/**/*", "src/features/admin/**/*", "src/features/home/apis/index.ts"], // or 'v8'
      },
    },
  }),
);
