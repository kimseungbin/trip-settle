<script lang="ts">
	import { onMount } from 'svelte'

	// Track localStorage items as reactive state
	let storageItems = $state<Record<string, string>>({})

	/**
	 * Read all localStorage items and update state
	 */
	function refreshStorageItems() {
		const items: Record<string, string> = {}
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i)
			if (key) {
				items[key] = localStorage.getItem(key) || ''
			}
		}
		storageItems = items
	}

	/**
	 * Clear a specific localStorage key
	 */
	function clearKey(key: string) {
		localStorage.removeItem(key)
		refreshStorageItems()

		// Dispatch custom event for components that listen to specific keys
		window.dispatchEvent(new Event('hint-status-changed'))
	}

	/**
	 * Clear all localStorage (useful for testing fresh user experience)
	 */
	function clearAll() {
		if (confirm('Clear all localStorage? This will reset onboarding, hints, and any other saved state.')) {
			localStorage.clear()
			refreshStorageItems()

			// Dispatch custom event
			window.dispatchEvent(new Event('hint-status-changed'))
		}
	}

	/**
	 * Get human-readable description for known localStorage keys
	 */
	function getKeyDescription(key: string): string {
		const descriptions: Record<string, string> = {
			hasSeenOnboarding: 'Tracks whether user has completed onboarding',
			'keyboard-hint-dismissed': 'Tracks whether user dismissed keyboard hints',
		}
		return descriptions[key] || 'Unknown key'
	}

	/**
	 * Format value for display (handle booleans, long strings, etc.)
	 */
	function formatValue(value: string): string {
		// If it looks like a boolean string
		if (value === 'true' || value === 'false') {
			return value === 'true' ? '✅ Yes' : '❌ No'
		}
		// Truncate long values
		if (value.length > 50) {
			return value.substring(0, 47) + '...'
		}
		return value
	}

	onMount(() => {
		// Initial load
		refreshStorageItems()

		// Listen for storage changes from other tabs/windows
		const handleStorageChange = () => {
			refreshStorageItems()
		}

		window.addEventListener('storage', handleStorageChange)

		// Listen for same-window updates
		const handleCustomUpdate = () => {
			refreshStorageItems()
		}
		window.addEventListener('hint-status-changed', handleCustomUpdate)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('hint-status-changed', handleCustomUpdate)
		}
	})
</script>

<div class="storage-viewer" data-testid="local-storage-viewer">
	<h3>📦 LocalStorage State</h3>

	{#if Object.keys(storageItems).length === 0}
		<div class="empty-state">
			<p>No localStorage items found. This is a fresh browser session.</p>
		</div>
	{:else}
		<div class="storage-items">
			{#each Object.entries(storageItems) as [key, value]}
				<div class="storage-row" data-testid="storage-item">
					<div class="key-info">
						<code class="key-name">{key}</code>
						<span class="key-description">{getKeyDescription(key)}</span>
					</div>
					<div class="value-actions">
						<span class="value">{formatValue(value)}</span>
						<button
							class="clear-btn"
							onclick={() => clearKey(key)}
							aria-label="Clear {key}"
							data-testid="clear-{key}"
						>
							Clear
						</button>
					</div>
				</div>
			{/each}
		</div>

		<div class="actions">
			<button class="clear-all-btn" onclick={clearAll} data-testid="clear-all-storage">
				🗑️ Clear All LocalStorage
			</button>
		</div>
	{/if}

	<div class="info">
		<p class="info-text">
			This viewer displays all localStorage keys and values. Use the clear buttons to reset state for testing.
		</p>
	</div>
</div>

<style>
	.storage-viewer {
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

	.empty-state {
		padding: 2em;
		text-align: center;
		color: #666;
		background: white;
		border-radius: 6px;
		border: 1px solid #e0e0e0;
	}

	.empty-state p {
		margin: 0;
	}

	.storage-items {
		display: flex;
		flex-direction: column;
		gap: 1em;
		margin-bottom: 1.5em;
	}

	.storage-row {
		background: white;
		padding: 1em;
		border-radius: 6px;
		border: 1px solid #e0e0e0;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.key-info {
		display: flex;
		flex-direction: column;
		gap: 0.3em;
	}

	.key-name {
		font-family: 'Courier New', monospace;
		font-size: 0.95em;
		font-weight: 600;
		color: #d63384;
		background: #f8f9fa;
		padding: 0.2em 0.5em;
		border-radius: 3px;
		align-self: flex-start;
	}

	.key-description {
		font-size: 0.85em;
		color: #666;
		font-style: italic;
	}

	.value-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1em;
	}

	.value {
		font-family: 'Courier New', monospace;
		color: #333;
		background: #f8f9fa;
		padding: 0.4em 0.6em;
		border-radius: 3px;
		flex: 1;
		font-size: 0.9em;
	}

	.clear-btn {
		background: #dc3545;
		color: white;
		border: none;
		padding: 0.4em 1em;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85em;
		font-weight: 600;
		transition: background 0.2s;
	}

	.clear-btn:hover {
		background: #c82333;
	}

	.clear-btn:focus {
		outline: 2px solid #dc3545;
		outline-offset: 2px;
	}

	.actions {
		margin-top: 1.5em;
		padding-top: 1.5em;
		border-top: 2px dashed #ffb300;
		display: flex;
		justify-content: center;
	}

	.clear-all-btn {
		background: #ff6f00;
		color: white;
		border: none;
		padding: 0.75em 2em;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1em;
		font-weight: 600;
		transition: all 0.2s;
	}

	.clear-all-btn:hover {
		background: #e65100;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(255, 111, 0, 0.3);
	}

	.clear-all-btn:focus {
		outline: 2px solid #ff6f00;
		outline-offset: 2px;
	}

	.info {
		margin-top: 1.5em;
		padding-top: 1em;
		border-top: 1px solid #ffb300;
	}

	.info-text {
		font-size: 0.85em;
		color: #666;
		margin: 0;
		line-height: 1.5;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.value-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.clear-btn {
			width: 100%;
		}
	}
</style>
