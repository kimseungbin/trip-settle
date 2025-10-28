/**
 * Focus management utilities
 *
 * These utilities provide consistent, WebKit-safe focus methods to work around
 * timing issues in Safari/WebKit browsers where focus() must be deferred to ensure
 * DOM elements are fully rendered and interactive.
 */

/**
 * Focus an element safely by deferring to the next animation frame.
 *
 * This method works around WebKit timing issues where calling focus() immediately
 * after DOM updates may not work because the element isn't fully rendered yet.
 *
 * @param element - The HTML element to focus (can be undefined/null)
 *
 * @example
 * ```typescript
 * let inputElement: HTMLInputElement | undefined
 *
 * onMount(() => {
 *   focusElement(inputElement)
 * })
 * ```
 */
export function focusElement(element: HTMLElement | undefined | null): void {
	if (!element) return

	requestAnimationFrame(() => {
		element.focus()
	})
}

/**
 * Focus an element immediately on the next tick using setTimeout(0).
 *
 * This is a lighter-weight alternative to requestAnimationFrame for cases where
 * you need to defer focus to the next event loop tick but don't need to wait
 * for the next paint.
 *
 * @param element - The HTML element to focus (can be undefined/null)
 * @param delay - Optional delay in milliseconds (default: 0)
 *
 * @example
 * ```typescript
 * // Focus on next tick
 * focusElementImmediate(inputElement)
 *
 * // Focus after 100ms (for additional timing safety)
 * focusElementImmediate(inputElement, 100)
 * ```
 */
export function focusElementImmediate(element: HTMLElement | undefined | null, delay: number = 0): void {
	if (!element) return

	setTimeout(() => {
		element.focus()
	}, delay)
}
