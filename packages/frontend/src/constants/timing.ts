/**
 * Timing constants for animations, delays, and focus management
 *
 * These constants provide a single source of truth for timing values used throughout
 * the application, making it easier to maintain consistent UX and adjust timing globally.
 */

/**
 * Focus timing constants
 *
 * Used by focus management utilities to work around browser-specific timing issues,
 * particularly with WebKit browsers (Safari, Mobile Safari).
 */
export const FOCUS_TIMING = {
	/**
	 * WebKit-safe focus delay (100ms)
	 *
	 * Used in CurrencySelector for auto-focus on mount. This timing ensures
	 * DOM elements are fully rendered and interactive before attempting focus.
	 */
	WEBKIT_SAFE: 100,

	/**
	 * Immediate focus (0ms)
	 *
	 * Used when focusing after user interaction where DOM is already stable.
	 * Example: Focusing search input after opening dropdown.
	 */
	IMMEDIATE: 0,
} as const

/**
 * Animation duration constants (milliseconds)
 *
 * Used for CSS transitions and JavaScript-triggered animations to maintain
 * consistent timing across the application.
 */
export const ANIMATION_DURATION = {
	/**
	 * Fast animation (300ms)
	 *
	 * Used for:
	 * - Payer list item addition animation (slide-in + highlight)
	 * - Keyboard hint slide-in animation
	 */
	FAST: 300,

	/**
	 * Blur delay for dropdown (150ms)
	 *
	 * Used in CurrencySelector to delay blur event, allowing click events
	 * on dropdown items to register before the dropdown closes.
	 */
	BLUR_DELAY: 150,
} as const

/**
 * Toast notification timing constants (milliseconds)
 *
 * Controls how long toast messages remain visible before auto-dismissing.
 */
export const TOAST_TIMING = {
	/**
	 * Keyboard hint toast duration (8000ms / 8 seconds)
	 *
	 * Longer duration for educational hints that users need time to read.
	 */
	KEYBOARD_HINT: 8000,

	/**
	 * Currency selection success (4000ms / 4 seconds)
	 *
	 * Standard duration for success messages in onboarding flow.
	 */
	CURRENCY_SUCCESS: 4000,

	/**
	 * Default toast duration (3000ms / 3 seconds)
	 *
	 * General-purpose duration for most toast notifications.
	 */
	DEFAULT: 3000,
} as const
