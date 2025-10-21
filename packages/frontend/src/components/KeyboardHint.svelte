<script lang="ts">
	import { onMount } from 'svelte'

	let {
		visible = false,
		onDismiss,
	}: {
		visible?: boolean
		onDismiss: () => void
	} = $props()

	let show = $state(false)

	onMount(() => {
		if (visible) {
			show = true
			// Auto-dismiss after 8 seconds
			const timer = setTimeout(() => {
				handleDismiss()
			}, 8000)

			return () => clearTimeout(timer)
		}
	})

	$effect(() => {
		if (visible) {
			show = true
		}
	})

	// Handle keyboard events
	$effect(() => {
		if (!visible) return

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				handleDismiss()
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	})

	function handleDismiss() {
		show = false
		// Wait for animation to complete before calling onDismiss
		setTimeout(() => {
			onDismiss()
		}, 300)
	}
</script>

{#if visible && show}
	<div class="toast" class:show>
		<span class="icon">💡</span>
		<div class="content">
			<strong>Keyboard tip:</strong> Press <kbd>Enter</kbd> to add, <kbd>Tab</kbd> to move between fields
		</div>
		<button class="dismiss" onclick={handleDismiss} aria-label="Dismiss tip">×</button>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		top: -100px;
		left: 50%;
		transform: translateX(-50%);
		background: #fff;
		border: 2px solid #ff3e00;
		border-radius: 8px;
		padding: 1em 1.5em;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		gap: 0.75em;
		max-width: 90%;
		width: 500px;
		z-index: 1000;
		transition: top 0.3s ease-out;
	}

	.toast.show {
		top: 20px;
	}

	.icon {
		font-size: 1.5em;
		flex-shrink: 0;
	}

	.content {
		flex: 1;
		font-size: 0.95em;
		color: #333;
		line-height: 1.4;
	}

	.content strong {
		color: #ff3e00;
	}

	kbd {
		display: inline-block;
		padding: 0.2em 0.4em;
		background: #f5f5f5;
		border: 1px solid #ccc;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.9em;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.dismiss {
		background: none;
		border: none;
		font-size: 1.5em;
		color: #999;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.dismiss:hover {
		background: #f5f5f5;
		color: #333;
	}

	@media (max-width: 600px) {
		.toast {
			width: 90%;
			padding: 0.875em 1em;
		}

		.content {
			font-size: 0.875em;
		}
	}
</style>
