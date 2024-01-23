import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    poolMatchGlobs: [
      ['**/resources/**/*.spec.ts', 'child_process'],
    ],
  },
})
