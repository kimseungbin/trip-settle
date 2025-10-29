/**
 * Keyboard event handling utilities for consistent keyboard interactions
 */

/**
 * Check if a key matches any of the provided key names
 */
export function isKey(event: KeyboardEvent, ...keys: string[]): boolean {
	return keys.includes(event.key)
}

/**
 * Handle Escape key press
 */
export function onEscape(event: KeyboardEvent, handler: () => void): boolean {
	if (event.key === 'Escape') {
		event.preventDefault()
		handler()
		return true
	}
	return false
}

/**
 * Handle Enter key press
 */
export function onEnter(event: KeyboardEvent, handler: () => void): boolean {
	if (event.key === 'Enter') {
		event.preventDefault()
		handler()
		return true
	}
	return false
}

/**
 * Handle arrow navigation (up/down)
 */
export function onArrowNavigation(
	event: KeyboardEvent,
	currentIndex: number,
	maxIndex: number,
	onIndexChange: (newIndex: number) => void
): boolean {
	if (event.key === 'ArrowDown') {
		event.preventDefault()
		onIndexChange(Math.min(currentIndex + 1, maxIndex))
		return true
	}
	if (event.key === 'ArrowUp') {
		event.preventDefault()
		onIndexChange(Math.max(currentIndex - 1, 0))
		return true
	}
	return false
}

/**
 * Create a keyboard handler for dropdown/list navigation
 *
 * @example
 * ```typescript
 * const handler = createListNavigationHandler({
 *   currentIndex: 0,
 *   itemCount: items.length,
 *   onIndexChange: (index) => selectedIndex = index,
 *   onSelect: () => selectItem(items[selectedIndex]),
 *   onClose: () => isOpen = false
 * })
 *
 * <input onkeydown={handler} />
 * ```
 */
export function createListNavigationHandler(options: {
	currentIndex: number
	itemCount: number
	onIndexChange: (index: number) => void
	onSelect: () => void
	onClose?: () => void
}): (event: KeyboardEvent) => void {
	return (event: KeyboardEvent) => {
		// Handle arrow navigation
		if (onArrowNavigation(event, options.currentIndex, options.itemCount - 1, options.onIndexChange)) {
			return
		}

		// Handle selection
		if (onEnter(event, options.onSelect)) {
			return
		}

		// Handle close/cancel
		if (options.onClose && onEscape(event, options.onClose)) {
			return
		}
	}
}

/**
 * Create a keyboard handler for toggle buttons (Enter/Space to activate)
 */
export function createToggleHandler(onToggle: () => void): (event: KeyboardEvent) => void {
	return (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
			event.preventDefault()
			onToggle()
		}
	}
}
