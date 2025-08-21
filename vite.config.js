import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	root: './',
	base: '/',
	build: { outDir: 'dist' },
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			'@components': resolve(__dirname, 'src/components'),
			'@services': resolve(__dirname, 'src/services'),
			'@state': resolve(__dirname, 'src/state'),
			'@utils': resolve(__dirname, 'src/utils')
		}
	},
	server: { port: 3000, open: true }
});