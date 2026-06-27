import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  base: './', // Use relative paths for Electron
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['sqlite3', 'sqlite', 'electron']
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    historyApiFallback: true
  },
  optimizeDeps: {
    exclude: ['sqlite3', 'sqlite', 'electron']
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
