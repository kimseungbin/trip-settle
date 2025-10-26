import { describe, it, expect, beforeEach } from 'vitest'
import { theme } from '../stores/theme.svelte'

describe('ThemeToggle Component', () => {
	beforeEach(() => {
		localStorage.clear()
		theme.mode = 'auto'
	})

	it('should allow cycling through theme modes', () => {
		// Start with auto
		expect(theme.mode).toBe('auto')

		// Switch to light
		theme.mode = 'light'
		expect(theme.mode).toBe('light')

		// Switch to dark
		theme.mode = 'dark'
		expect(theme.mode).toBe('dark')

		// Switch back to auto
		theme.mode = 'auto'
		expect(theme.mode).toBe('auto')
	})

	it('should persist theme mode to localStorage', () => {
		theme.mode = 'dark'
		expect(localStorage.getItem('theme-mode')).toBe('dark')

		theme.mode = 'light'
		expect(localStorage.getItem('theme-mode')).toBe('light')
	})
})
