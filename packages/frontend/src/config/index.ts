/**
 * @file Frontend-specific configuration
 * Uses Vite environment variables (available at build time)
 */

// Determine environment from Vite's MODE
// - 'production' when running `vite build` (GitHub Pages, deployments)
// - 'development' when running `vite` or `vite dev`
const environment = import.meta.env.PROD ? 'production' : 'local'

// In browser, we use hardcoded local development values
// For production, these values aren't needed (static site on GitHub Pages)
export const config = {
	environment: environment as 'local' | 'production',
	url: 'http://localhost:5173',
	apiUrl: 'http://localhost:3000/api',
	port: 5173,
}

export type FrontendConfig = typeof config
