import { addMessages, init, getLocaleFromNavigator, locale as localeStore } from 'svelte-i18n'

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

/**
 * Set the current locale and save to localStorage
 * @param newLocale - The locale to switch to
 */
export function setLocale(newLocale: SupportedLocale): void {
	localeStore.set(newLocale)
	localStorage.setItem('locale', newLocale)
}
