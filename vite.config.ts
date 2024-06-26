import path from 'path'
import { defineConfig } from 'vite'
import pluginWindiCSS from 'vite-plugin-windicss'

import pluginVue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    pluginVue(),
    pluginWindiCSS()
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      }
    ]
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/element-plus.scss" as *;'
      }
    }
  },
  server: {
    port: 8080,
    open: true
  }
})
