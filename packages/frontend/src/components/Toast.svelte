<script lang="ts">
	import { toast } from '../stores/toast.svelte'

	/**
	 * Get icon for toast type
	 */
	function getIcon(type: string): string {
		switch (type) {
			case 'success':
				return '✓'
			case 'error':
				return '✕'
			case 'warning':
				return '⚠'
			default:
				return 'ℹ'
		}
	}
</script>

<!-- ARIA live region for accessibility -->
<div class="toast-container" aria-live="polite" aria-atomic="true">
	{#each toast.toasts as t (t.id)}
		<div class="toast toast-{t.type}" role="status">
			<span class="toast-icon">{getIcon(t.type)}</span>
			<span class="toast-message">{t.message}</span>
			<button class="toast-close" onclick={() => toast.dismiss(t.id)} aria-label="Dismiss notification">
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 400px;
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		background: var(--color-surface);
		border-radius: 8px;
		box-shadow: var(--shadow-xl);
		border-left: 4px solid;
		animation: slideInRight 0.3s ease-out;
		pointer-events: auto;
		min-width: 280px;
	}

	@keyframes slideInRight {
		from {
			transform: translateX(120%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.toast-info {
		border-left-color: var(--color-info, #3b82f6);
	}

	.toast-success {
		border-left-color: var(--color-success, #22c55e);
	}

	.toast-warning {
		border-left-color: var(--color-warning, #f59e0b);
	}

	.toast-error {
		border-left-color: var(--color-error, #ef4444);
	}

	.toast-icon {
		font-size: 1.25rem;
		font-weight: bold;
		flex-shrink: 0;
	}

	.toast-info .toast-icon {
		color: var(--color-info, #3b82f6);
	}

	.toast-success .toast-icon {
		color: var(--color-success, #22c55e);
	}

	.toast-warning .toast-icon {
		color: var(--color-warning, #f59e0b);
	}

	.toast-error .toast-icon {
		color: var(--color-error, #ef4444);
	}

	.toast-message {
		flex: 1;
		color: var(--color-text);
		font-size: 0.95rem;
		line-height: 1.4;
	}

	.toast-close {
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.toast-close:hover {
		background: var(--color-surface-1);
		color: var(--color-text);
	}

	.toast-close:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.toast-container {
			bottom: 1rem;
			right: 1rem;
			left: 1rem;
			max-width: none;
		}

		.toast {
			min-width: auto;
			padding: 0.875rem 1rem;
		}

		.toast-message {
			font-size: 0.9rem;
		}
	}
</style>
