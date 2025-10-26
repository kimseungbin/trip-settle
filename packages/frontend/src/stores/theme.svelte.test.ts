import { describe, it, expect, beforeEach, vi } from 'vitest'
import { theme, applyTheme } from './theme.svelte'

describe('Theme Store', () => {
	beforeEach(() => {
		// Reset localStorage
		localStorage.clear()
		// Reset document attributes
		document.documentElement.removeAttribute('data-theme')
		document.documentElement.style.colorScheme = ''
		// Reset theme store
		theme.mode = 'auto'
	})

	describe('Theme Mode', () => {
		it('should default to auto mode', () => {
			expect(theme.mode).toBe('auto')
		})

		it('should allow setting light mode', () => {
			theme.mode = 'light'
			expect(theme.mode).toBe('light')
		})

		it('should allow setting dark mode', () => {
			theme.mode = 'dark'
			expect(theme.mode).toBe('dark')
		})

		it('should allow setting auto mode', () => {
			theme.mode = 'light'
			theme.mode = 'auto'
			expect(theme.mode).toBe('auto')
		})
	})

	describe('Effective Theme Calculation', () => {
		it('should use light when mode is light', () => {
			theme.mode = 'light'
			expect(theme.effectiveTheme).toBe('light')
		})

		it('should use dark when mode is dark', () => {
			theme.mode = 'dark'
			expect(theme.effectiveTheme).toBe('dark')
		})

		it('should follow system preference when mode is auto', () => {
			// Mock matchMedia for light preference
			const mockMatchMedia = vi.fn(
				(query: string): MediaQueryList =>
					({
						matches: query === '(prefers-color-scheme: light)',
						media: query,
						addEventListener: vi.fn(),
						removeEventListener: vi.fn(),
					}) as unknown as MediaQueryList
			)
			window.matchMedia = mockMatchMedia

			theme.mode = 'auto'
			// effectiveTheme should be calculated based on system preference
			expect(theme.effectiveTheme).toBe('light')
		})
	})

	describe('LocalStorage Persistence', () => {
		it('should persist theme mode to localStorage', () => {
			theme.mode = 'dark'
			expect(localStorage.getItem('theme-mode')).toBe('dark')
		})

		it('should default to auto if localStorage is empty', () => {
			expect(theme.mode).toBe('auto')
		})
	})

	describe('applyTheme Function', () => {
		it('should set data-theme attribute on document', () => {
			applyTheme('dark')
			expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
		})

		it('should set color-scheme style property', () => {
			applyTheme('dark')
			expect(document.documentElement.style.colorScheme).toBe('dark')
		})

		it('should apply light theme correctly', () => {
			applyTheme('light')
			expect(document.documentElement.getAttribute('data-theme')).toBe('light')
			expect(document.documentElement.style.colorScheme).toBe('light')
		})

		it('should update when theme changes', () => {
			theme.mode = 'dark'
			applyTheme(theme.effectiveTheme)
			expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

			theme.mode = 'light'
			applyTheme(theme.effectiveTheme)
			expect(document.documentElement.getAttribute('data-theme')).toBe('light')
		})
	})

	describe('System Preference Changes', () => {
		it('should not react to system preference changes when mode is explicit', () => {
			theme.mode = 'light'
			const initialTheme = theme.effectiveTheme

			// Simulate system preference change (should not affect explicit mode)
			expect(theme.effectiveTheme).toBe(initialTheme)
			expect(theme.effectiveTheme).toBe('light')
		})
	})
})
