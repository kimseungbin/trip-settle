<script lang="ts">
	import { onMount } from 'svelte'
	import { shouldShowKeyboardHint } from '../lib/keyboardHint'

	let hintsEnabled = $state(false)

	function updateHintStatus() {
		hintsEnabled = shouldShowKeyboardHint()
	}

	onMount(() => {
		// Initial check
		updateHintStatus()

		// Listen for storage changes (when localStorage is updated)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'keyboard-hint-dismissed') {
				updateHintStatus()
			}
		}

		window.addEventListener('storage', handleStorageChange)

		// Also set up a custom event listener for same-window updates
		const handleCustomUpdate = () => {
			updateHintStatus()
		}
		window.addEventListener('hint-status-changed', handleCustomUpdate)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('hint-status-changed', handleCustomUpdate)
		}
	})
</script>

<div class="debugger" data-testid="hint-debugger">
	<h3>Hint Debugger (Local Only)</h3>

	<div class="debug-row">
		<span class="label">Keyboard Hints:</span>
		<div class="status {hintsEnabled ? 'enabled' : 'disabled'}">
			{#if hintsEnabled}
				<span>✅ Hints Enabled</span>
			{:else}
				<span>🚫 Hints Disabled</span>
			{/if}
		</div>
	</div>

	<div class="debug-info">
		<p class="info-text">
			This component shows the current state of keyboard hints. Hints are shown to new users and can be dismissed.
			LocalStorage key: <code>keyboard-hint-dismissed</code>
		</p>
	</div>
</div>

<style>
	.debugger {
		margin: 2em 0;
		padding: 1.5em;
		border-radius: 8px;
		background: #fff9e6;
		border: 2px dashed #ffb300;
	}

	h3 {
		margin: 1em 0 0.5em;
		color: #ff6f00;
		font-size: 1.1em;
	}

	.debug-row {
		display: flex;
		align-items: center;
		gap: 1em;
		margin-bottom: 1em;
	}

	.debug-row .label {
		font-weight: 600;
		min-width: 120px;
		color: #333;
	}

	.status {
		padding: 0.5em 1em;
		border-radius: 6px;
		font-weight: bold;
		flex: 1;
	}

	.status.enabled {
		background: #d4edda;
		color: #155724;
	}

	.status.disabled {
		background: #f8d7da;
		color: #721c24;
	}

	.debug-info {
		margin-top: 1em;
		padding-top: 1em;
		border-top: 1px solid #ffb300;
	}

	.info-text {
		font-size: 0.85em;
		color: #666;
		margin: 0;
		line-height: 1.5;
	}

	code {
		background: #fff;
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
		font-size: 0.9em;
		color: #d63384;
	}
</style>
