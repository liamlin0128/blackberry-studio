import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: { port: 5175, strictPort: true, allowedHosts: ['weiping.wang'] },
  preview: { allowedHosts: ['weiping.wang'] },
})
