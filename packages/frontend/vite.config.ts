import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Vite config is evaluated at build time, so we use environment variables
// or fallback to local development defaults
const port = parseInt(process.env.FRONTEND_PORT || '5173')
const backendUrl = process.env.API_URL ? process.env.API_URL.replace('/api', '') : 'http://localhost:3000'

// For GitHub Pages deployment, set base to repository name
// In development and other deployments, use root
const base = process.env.VITE_BASE_PATH || '/'

// Only expose to network (0.0.0.0) when needed for local cross-device testing
// In CI, this defaults to false (no network exposure needed)
// In Docker E2E, the --host CLI flag overrides this config (required for inter-container communication)
const shouldExposeToNetwork = process.env.CI !== 'true' && process.env.VITE_HOST !== 'false'

export default defineConfig({
	base,
	plugins: [svelte()],
	server: {
		port,
		host: shouldExposeToNetwork, // Expose to network only in local dev (not CI)
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
