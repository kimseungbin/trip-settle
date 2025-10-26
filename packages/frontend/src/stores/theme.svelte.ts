/**
 * Theme store - manages application theme with light/dark/auto modes
 *
 * Features:
 * - Three modes: 'light', 'dark', 'auto'
 * - Auto mode follows system preference (prefers-color-scheme)
 * - Persists user preference to localStorage
 * - Reactive effectiveTheme calculation
 * - Applies theme to document via data-theme attribute and color-scheme property
 */

export type ThemeMode = 'light' | 'dark' | 'auto'
export type EffectiveTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

/**
 * Get system preference for color scheme
 */
function getSystemPreference(): EffectiveTheme {
	if (typeof window === 'undefined') return 'light'

	const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
	return darkModeQuery.matches ? 'dark' : 'light'
}

/**
 * Load saved theme mode from localStorage
 */
function loadThemeMode(): ThemeMode {
	if (typeof window === 'undefined') return 'auto'

	const saved = localStorage.getItem(STORAGE_KEY)
	if (saved === 'light' || saved === 'dark' || saved === 'auto') {
		return saved
	}
	return 'auto'
}

/**
 * Save theme mode to localStorage
 */
function saveThemeMode(mode: ThemeMode): void {
	if (typeof window === 'undefined') return
	localStorage.setItem(STORAGE_KEY, mode)
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: EffectiveTheme): void {
	if (typeof document === 'undefined') return

	document.documentElement.setAttribute('data-theme', theme)
	document.documentElement.style.colorScheme = theme
}

/**
 * Theme store state
 */
class ThemeStore {
	#mode = $state<ThemeMode>(loadThemeMode())
	#systemPreference = $state<EffectiveTheme>(getSystemPreference())

	constructor() {
		// Listen for system preference changes
		if (typeof window !== 'undefined') {
			const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
			darkModeQuery.addEventListener('change', e => {
				this.#systemPreference = e.matches ? 'dark' : 'light'
			})
		}
	}

	get mode(): ThemeMode {
		return this.#mode
	}

	set mode(value: ThemeMode) {
		this.#mode = value
		saveThemeMode(value)
	}

	get effectiveTheme(): EffectiveTheme {
		if (this.#mode === 'auto') {
			return this.#systemPreference
		}
		return this.#mode
	}
}

export const theme = new ThemeStore()

/**
 * Initialize theme system - call this once on app startup
 */
export function initTheme(): void {
	applyTheme(theme.effectiveTheme)

	// Watch for theme changes and apply them
	$effect(() => {
		applyTheme(theme.effectiveTheme)
	})
}
