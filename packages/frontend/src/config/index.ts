/**
 * @file Frontend-specific configuration
 * Uses Vite environment variables (available at build time)
 */

import { PORTS, LOCAL_URLS } from '../../../../constants.js'

// Determine environment from Vite's MODE
// - 'production' when running `vite build` (GitHub Pages, deployments)
// - 'development' when running `vite` or `vite dev`
const environment = import.meta.env.PROD ? 'production' : 'local'

// In browser, we use shared constants for local development
// For production, these values aren't needed (static site on GitHub Pages)
export const config = {
	environment: environment as 'local' | 'production',
	url: LOCAL_URLS.frontend,
	apiUrl: LOCAL_URLS.api,
	port: PORTS.frontend,
}

export type FrontendConfig = typeof config
