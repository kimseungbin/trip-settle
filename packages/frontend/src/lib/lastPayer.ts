/**
 * Local storage utility for remembering the last selected payer
 * This helps users in collaborative expense tracking scenarios where
 * multiple people are adding expenses to the same list
 */

const STORAGE_KEY = 'lastSelectedPayer'

/**
 * Save the last selected payer to local storage
 * @param payer - The payer name to remember
 */
export function saveLastPayer(payer: string): void {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return
	}

	try {
		localStorage.setItem(STORAGE_KEY, payer)
	} catch (error) {
		console.error('Failed to save last payer to localStorage:', error)
	}
}

/**
 * Load the last selected payer from local storage
 * @returns The last selected payer name, or empty string if none found
 */
export function loadLastPayer(): string {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return ''
	}

	try {
		return localStorage.getItem(STORAGE_KEY) || ''
	} catch (error) {
		console.error('Failed to load last payer from localStorage:', error)
		return ''
	}
}

/**
 * Clear the last selected payer from local storage
 */
export function clearLastPayer(): void {
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return
	}

	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch (error) {
		console.error('Failed to clear last payer from localStorage:', error)
	}
}
