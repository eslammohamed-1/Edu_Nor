import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const appDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(appDir, '..');

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@questionBank': join(repoRoot, 'data/question-bank')
    }
  }
});
