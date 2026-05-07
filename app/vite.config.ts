import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { dirname, join } from 'node:path'

const appDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(appDir, '..')
const buildBase = process.env.VITE_BASE_PATH ?? '/Edu_Nor/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? buildBase : '/',
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
