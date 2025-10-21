/**
 * @file Frontend-specific configuration
 * Uses hardcoded values for browser (can't access process.env)
 */

// In browser, we use hardcoded local development values
// For production, these should be replaced during build with Vite's define
export const config = {
	environment: 'local' as const,
	url: 'http://localhost:5173',
	apiUrl: 'http://localhost:3000/api',
	port: 5173,
}

export type FrontendConfig = typeof config
