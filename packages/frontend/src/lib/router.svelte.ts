/**
 * Simple client-side router using the History API and Svelte 5 runes
 *
 * This router provides:
 * - URL-based navigation without page reloads
 * - Browser back/forward button support
 * - Reactive route updates using Svelte 5 $state rune
 * - GitHub Pages SPA routing support with base path handling
 */

// Get base path from Vite's import.meta.env.BASE_URL
// This is set via VITE_BASE_PATH environment variable during build
// For GitHub Pages: '/trip-settle/', for local dev: '/'
const BASE_PATH = import.meta.env.BASE_URL

// Current route state (reactive)
let currentRoute = $state(getCurrentPath())

/**
 * Get the current pathname from the browser, relative to the base path
 * For example, if BASE_PATH is '/trip-settle/' and pathname is '/trip-settle/onboarding',
 * this returns '/onboarding'
 */
function getCurrentPath(): string {
	const fullPath = window.location.pathname

	// Remove base path from the pathname to get the route
	if (fullPath.startsWith(BASE_PATH)) {
		const route = fullPath.slice(BASE_PATH.length - 1) || '/'
		return route
	}

	return fullPath
}

/**
 * Navigate to a new route
 * @param path - The path to navigate to (e.g., '/', '/onboarding')
 */
export function navigate(path: string): void {
	// Don't navigate if already on this path
	if (path === currentRoute) return

	// Convert app route to full URL path by prepending base path
	// For example: '/onboarding' -> '/trip-settle/onboarding' on GitHub Pages
	const fullPath = BASE_PATH.slice(0, -1) + path

	// Update browser history without page reload
	window.history.pushState(null, '', fullPath)

	// Update reactive state to trigger re-renders
	currentRoute = path

	// Scroll to top of page (mimic browser behavior for new page loads)
	window.scrollTo(0, 0)
}

/**
 * Get the current route (reactive)
 * Components that access this will automatically re-render when the route changes
 */
export function getRoute(): string {
	return currentRoute
}

/**
 * Handle browser back/forward buttons
 * This listens to the popstate event which fires when user navigates with browser buttons
 */
function handlePopState(): void {
	currentRoute = getCurrentPath()
}

/**
 * Initialize router: set up event listeners
 * Should be called once when the app starts
 */
export function initRouter(): void {
	// Handle redirect from 404.html (GitHub Pages SPA routing)
	// When a user refreshes at /trip-settle/onboarding, GitHub Pages serves 404.html
	// which stores the intended path in sessionStorage and redirects to /trip-settle/
	const redirectPath = sessionStorage.getItem('redirectPath')
	if (redirectPath) {
		sessionStorage.removeItem('redirectPath')

		// Convert the full path to an app route and restore it
		const route = getCurrentPathFromFullPath(redirectPath)
		const fullPath = BASE_PATH.slice(0, -1) + route
		window.history.replaceState(null, '', fullPath)
		currentRoute = route
	} else {
		// Normal initialization: sync route state with current URL
		currentRoute = getCurrentPath()
	}

	// Listen for browser back/forward buttons
	window.addEventListener('popstate', handlePopState)

	// Expose navigate function to window for testing
	// @ts-expect-error - intentionally adding to window for E2E tests
	window.__navigate = navigate
}

/**
 * Helper function to extract app route from full URL path
 */
function getCurrentPathFromFullPath(fullPath: string): string {
	// Remove base path from the pathname to get the route
	if (fullPath.startsWith(BASE_PATH)) {
		const route = fullPath.slice(BASE_PATH.length - 1) || '/'
		return route
	}
	return fullPath
}

/**
 * Clean up router: remove event listeners
 * Should be called when app unmounts (mainly for testing)
 */
export function destroyRouter(): void {
	window.removeEventListener('popstate', handlePopState)

	// Clean up test helper
	// @ts-expect-error - intentionally removing from window
	delete window.__navigate
}
