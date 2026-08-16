import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync, mkdirSync } from 'fs';

function copyRuntimeAssets() {
  const runtimeTrees = [
    ['assets/images/trebek', 'dist/assets/images/trebek'],
    ['assets/audio/trebek', 'dist/assets/audio/trebek'],
  ];

  return {
    name: 'copy-runtime-assets',
    apply: 'build',
    closeBundle() {
      for (const [source, destination] of runtimeTrees) {
        if (!existsSync(source)) continue;
        mkdirSync(destination, { recursive: true });
        cpSync(source, destination, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  root: './',
  base: './',
  plugins: [copyRuntimeAssets()],
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@state': resolve(__dirname, 'src/state'),
      '@utils': resolve(__dirname, 'src/utils')
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
