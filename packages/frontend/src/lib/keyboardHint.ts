/**
 * Get the settings store lazily to avoid initialization issues during SSR or early page load
 */
function getSettings() {
	// Using dynamic import causes issues, so we read directly from localStorage
	// and sync with the store when it's safe
	try {
		const stored = localStorage.getItem('appSettings')
		if (stored) {
			const parsed = JSON.parse(stored)
			return parsed.system?.hasSeenKeyboardHint || false
		}

		// Check legacy key
		const legacy = localStorage.getItem('keyboardHintDismissed')
		return legacy === 'true'
	} catch {
		return false
	}
}

export function shouldShowKeyboardHint(): boolean {
	if (typeof window === 'undefined') return false
	return !getSettings()
}

export function dismissKeyboardHint(): void {
	if (typeof window === 'undefined') return

	// Update localStorage directly to avoid initialization timing issues
	try {
		const stored = localStorage.getItem('appSettings')
		if (stored) {
			const parsed = JSON.parse(stored)
			parsed.system = parsed.system || {}
			parsed.system.hasSeenKeyboardHint = true
			localStorage.setItem('appSettings', JSON.stringify(parsed))
		} else {
			// Create new settings structure
			localStorage.setItem(
				'appSettings',
				JSON.stringify({
					features: {
						isOnboarded: false,
						currencyMode: 'multi',
						defaultCurrency: 'KRW',
					},
					system: {
						hasSeenKeyboardHint: true,
					},
				})
			)
		}
	} catch (error) {
		console.error('Failed to update keyboard hint preference:', error)
	}

	// Dispatch custom event for same-window updates
	window.dispatchEvent(new CustomEvent('hint-status-changed'))
}
