import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cp } from 'fs/promises';

function copyRuntimeAssets() {
  const runtimeAssetDirs = [
    ['assets/questions', 'dist/assets/questions'],
    ['assets/images/trebek', 'dist/assets/images/trebek'],
    ['assets/audio', 'dist/assets/audio'],
    ['site', 'dist/site']
  ];

  return {
    name: 'copy-runtime-assets',
    apply: 'build',
    async closeBundle() {
      await Promise.all(
        runtimeAssetDirs.map(([from, to]) => cp(from, to, { recursive: true, force: true }))
      );
    }
  };
}

export default defineConfig({
  root: './',
  base: './',
  plugins: [copyRuntimeAssets()],
  build: {
    outDir: 'dist',
    copyPublicDir: true,
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
