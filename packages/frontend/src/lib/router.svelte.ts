/**
 * Simple client-side router using the History API and Svelte 5 runes
 *
 * This router provides:
 * - URL-based navigation without page reloads
 * - Browser back/forward button support
 * - Reactive route updates using Svelte 5 $state rune
 */

// Current route state (reactive)
let currentRoute = $state(getCurrentPath())

/**
 * Get the current pathname from the browser
 */
function getCurrentPath(): string {
	return window.location.pathname
}

/**
 * Navigate to a new route
 * @param path - The path to navigate to (e.g., '/', '/onboarding')
 */
export function navigate(path: string): void {
	// Don't navigate if already on this path
	if (path === currentRoute) return

	// Update browser history without page reload
	window.history.pushState(null, '', path)

	// Update reactive state to trigger re-renders
	currentRoute = path
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
	// Listen for browser back/forward buttons
	window.addEventListener('popstate', handlePopState)

	// Expose navigate function to window for testing
	// @ts-expect-error - intentionally adding to window for E2E tests
	window.__navigate = navigate

	// Sync route state with current URL on init
	currentRoute = getCurrentPath()
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
