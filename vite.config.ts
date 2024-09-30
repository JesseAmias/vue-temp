import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'node:path'

// https://vitejs.dev/config/
const pathSrc = fileURLToPath(new URL('./src', import.meta.url))

export default ({ mode }: { mode: string }) => {
  const VITE_APP_BASE_API: string = loadEnv(mode, process.cwd()).VITE_APP_BASE_API
  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ],
        dts: path.resolve(pathSrc, 'components.d.ts')
      }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ],
        dts: path.resolve(pathSrc, 'auto-imports.d.ts')
      }),
      basicSsl(),
      vueDevTools()
    ],
    resolve: {
      alias: {
        '@': pathSrc
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/styles/var.scss" as *;`
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: `https://${VITE_APP_BASE_API}/`,
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'ui'
    },
    test: {
      // 启用类似 jest 的全局测试 API
      globals: true,
      // 使用 happy-dom 模拟 DOM
      // 这需要你安装 happy-dom 作为对等依赖（peer dependency）
      environment: 'happy-dom',
      deps: {
        inline: ['element-plus']
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        reportsDirectory: './coverage'
      }
    }
  })
}
