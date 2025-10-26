/**
 * Toast notification store using Svelte 5 runes
 *
 * Manages temporary notification messages with auto-dismiss functionality
 */

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
	id: string
	message: string
	type: ToastType
	duration: number
}

class ToastStore {
	toasts = $state<Toast[]>([])

	/**
	 * Show a toast notification
	 * @param message - The message to display
	 * @param type - Toast type (info, success, warning, error)
	 * @param duration - How long to show the toast in milliseconds (default: 3000)
	 */
	show(message: string, type: ToastType = 'info', duration: number = 3000) {
		const id = crypto.randomUUID()
		const toast: Toast = { id, message, type, duration }

		this.toasts = [...this.toasts, toast]

		// Auto-dismiss after duration
		setTimeout(() => {
			this.dismiss(id)
		}, duration)

		return id
	}

	/**
	 * Dismiss a specific toast by ID
	 */
	dismiss(id: string) {
		this.toasts = this.toasts.filter(t => t.id !== id)
	}

	/**
	 * Convenience methods for different toast types
	 */
	info(message: string, duration?: number) {
		return this.show(message, 'info', duration)
	}

	success(message: string, duration?: number) {
		return this.show(message, 'success', duration)
	}

	warning(message: string, duration?: number) {
		return this.show(message, 'warning', duration)
	}

	error(message: string, duration?: number) {
		return this.show(message, 'error', duration)
	}
}

export const toast = new ToastStore()
