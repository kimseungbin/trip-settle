import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n'

import en from './locales/en.json'
import ko from './locales/ko.json'

// Add translation messages
addMessages('en', en)
addMessages('ko', ko)

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'ko'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

// Get initial locale from localStorage or browser
function getInitialLocale(): string {
	// Check localStorage first
	const stored = localStorage.getItem('locale')
	if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
		return stored
	}

	// Fallback to browser language detection
	const browserLocale = getLocaleFromNavigator()
	if (browserLocale?.startsWith('ko')) {
		return 'ko'
	}

	// Default to English
	return 'en'
}

// Initialize i18n
init({
	fallbackLocale: 'en',
	initialLocale: getInitialLocale(),
})

// Save locale to localStorage when it changes
export function setLocale(locale: SupportedLocale): void {
	localStorage.setItem('locale', locale)
	// Locale change will be handled by svelte-i18n's locale store
}
