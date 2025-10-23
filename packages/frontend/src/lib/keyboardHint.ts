import { settings } from '../stores/settings.svelte'

export function shouldShowKeyboardHint(): boolean {
	if (typeof window === 'undefined') return false
	return !settings.hasSeenKeyboardHint
}

export function dismissKeyboardHint(): void {
	if (typeof window === 'undefined') return
	settings.updateSystemPreferences({ hasSeenKeyboardHint: true })
	// Dispatch custom event for same-window updates (storage event doesn't fire in same window)
	window.dispatchEvent(new CustomEvent('hint-status-changed'))
}
