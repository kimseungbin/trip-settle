const STORAGE_KEY = 'keyboard-hint-dismissed'

export function shouldShowKeyboardHint(): boolean {
	if (typeof window === 'undefined') return false
	return localStorage.getItem(STORAGE_KEY) !== 'true'
}

export function dismissKeyboardHint(): void {
	if (typeof window === 'undefined') return
	localStorage.setItem(STORAGE_KEY, 'true')
}
