import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Vite config is evaluated at build time, so we use environment variables
// or fallback to local development defaults
const port = parseInt(process.env.FRONTEND_PORT || '5173')
const backendUrl = process.env.API_URL ? process.env.API_URL.replace('/api', '') : 'http://localhost:3000'

export default defineConfig({
	plugins: [svelte()],
	server: {
		port,
		host: true, // true = 0.0.0.0 + disable host check (Vite 6+)
		strictPort: false,
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
	test: {
		globals: true,
		environment: 'happy-dom',
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/e2e/**', // Exclude Playwright E2E tests
			'**/visual/**', // Exclude Playwright visual tests
			'**/accessibility/**', // Exclude Playwright a11y tests
			'**/.{idea,git,cache,output,temp}/**',
		],
	},
})
