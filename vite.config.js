import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['better-sqlite3', 'electron']
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    historyApiFallback: true
  },
  optimizeDeps: {
    exclude: ['better-sqlite3', 'electron']
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.vue', '.json']
  }
});
