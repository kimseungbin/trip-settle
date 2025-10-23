import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Vite config is evaluated at build time, so we use environment variables
// or fallback to local development defaults
const port = parseInt(process.env.FRONTEND_PORT || '5173')
const backendUrl = process.env.API_URL ? process.env.API_URL.replace('/api', '') : 'http://localhost:3000'

// For GitHub Pages deployment, set base to repository name
// In development and other deployments, use root
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
	base,
	plugins: [svelte()],
	server: {
		port,
		host: true, // Listen on 0.0.0.0 (all interfaces)
		strictPort: false,
		// Allow requests from Docker service names and localhost
		allowedHosts: ['frontend', 'localhost', '127.0.0.1', '.localhost'],
		fs: {
			strict: false,
		},
		proxy: {
			'/api': {
				target: backendUrl,
				changeOrigin: true,
			},
		},
		hmr: {
			clientPort: port,
		},
	},
})
