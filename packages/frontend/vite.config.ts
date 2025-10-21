import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Vite config is evaluated at build time, so we use environment variables
// or fallback to local development defaults
const port = parseInt(process.env.FRONTEND_PORT || '5173')
const backendUrl = process.env.API_URL
	? process.env.API_URL.replace('/api', '')
	: 'http://localhost:3000'

export default defineConfig({
	plugins: [svelte()],
	server: {
		port,
		host: true, // Expose to local network
		proxy: {
			'/api': {
				target: backendUrl,
				changeOrigin: true,
			},
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
	},
})
