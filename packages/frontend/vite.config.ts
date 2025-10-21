import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { config } from './src/config'

export default defineConfig({
	plugins: [svelte()],
	server: {
		port: config.port,
		proxy: {
			'/api': {
				target: config.apiUrl.replace('/api', ''),
				changeOrigin: true,
			},
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
	},
})
