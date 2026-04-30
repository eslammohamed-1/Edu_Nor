import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { dirname, join } from 'node:path'

const appDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(appDir, '..')

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/Edu_Nor/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@questionBank': join(repoRoot, 'data/question-bank')
    }
  },
  server: {
    fs: {
      allow: [appDir, repoRoot]
    }
  }
}))
