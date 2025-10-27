<script lang="ts">
	import { settings } from '../stores/settings.svelte'
	import { navigate } from '../lib/router.svelte'

	let keyboardHintsExpanded = $state(false)

	// Get all keyboard hints from localStorage
	const keyboardHints = $derived.by(() => {
		if (typeof window === 'undefined') return []
		try {
			const stored = localStorage.getItem('appSettings')
			if (stored) {
				const parsed = JSON.parse(stored)
				const hints = parsed.system?.keyboardHints || {}
				return Object.entries(hints).map(([id, dismissed]) => ({ id, dismissed: dismissed as boolean }))
			}
		} catch {
			// Ignore errors
		}
		return []
	})

	function resetOnboarding() {
		if (confirm('Reset onboarding? This will clear all settings and redirect to onboarding screen.')) {
			settings.resetSettings()
			navigate('/onboarding')
		}
	}

	function resetSystemPreferences() {
		if (confirm('Reset system preferences only? Feature settings will be preserved.')) {
			settings.resetSystemPreferences()
			window.location.reload() // Reload to reflect changes
		}
	}

	function toggleKeyboardHint(hintId: string) {
		if (settings.hasSeenHint(hintId)) {
			// To "undismiss", we need to manipulate localStorage directly
			// since there's no API to undismiss a specific hint
			try {
				const stored = localStorage.getItem('appSettings')
				if (stored) {
					const parsed = JSON.parse(stored)
					if (parsed.system?.keyboardHints?.[hintId]) {
						delete parsed.system.keyboardHints[hintId]
						localStorage.setItem('appSettings', JSON.stringify(parsed))
						window.location.reload()
					}
				}
			} catch (error) {
				console.error('Failed to toggle hint:', error)
			}
		} else {
			settings.dismissHint(hintId)
			window.location.reload()
		}
	}

	function toggleOnboarding() {
		settings.__dev_toggleOnboarding()
		// Reload to reflect routing changes
		window.location.reload()
	}
</script>

<div class="settings-viewer" data-testid="settings-viewer">
	<h3>⚙️ Settings</h3>

	<div class="settings-section">
		<div class="section-header">Onboarding</div>
		<button class="reset-onboarding-button" onclick={toggleOnboarding} tabindex="-1"> Reset Onboarding </button>
	</div>

	<div class="settings-section">
		<div class="section-header">System Preferences (Mutable)</div>
		<div class="settings-grid">
			<!-- Collapsible Keyboard Hints Section -->
			<div class="collapsible-section">
				<button
					class="collapsible-header"
					onclick={() => (keyboardHintsExpanded = !keyboardHintsExpanded)}
					tabindex="-1"
				>
					<span class="expand-icon">{keyboardHintsExpanded ? '▼' : '▶'}</span>
					<span class="section-title">
						Keyboard Hints ({keyboardHints.length} dismissed)
					</span>
				</button>

				{#if keyboardHintsExpanded}
					<div class="collapsible-content">
						{#if keyboardHints.length === 0}
							<div class="empty-state">No hints dismissed yet</div>
						{:else}
							{#each keyboardHints as hint (hint.id)}
								<div class="hint-item">
									<span class="hint-id">{hint.id}</span>
									<span class="hint-status">
										{hint.dismissed ? '✅ Dismissed' : '❌ Active'}
									</span>
									<button
										class="toggle-button"
										onclick={() => toggleKeyboardHint(hint.id)}
										tabindex="-1"
									>
										Toggle
									</button>
								</div>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="actions">
		<button class="danger" onclick={resetOnboarding} tabindex="-1">Reset All Settings</button>
		<button class="warning" onclick={resetSystemPreferences} tabindex="-1">Reset System Preferences</button>
	</div>
</div>

<style>
	.settings-viewer {
		padding: 1em;
		border-radius: 8px;
		background: var(--color-surface);
		box-shadow: var(--shadow-md);
	}

	h3 {
		margin: 0 0 1em;
		color: var(--color-text);
		font-size: 1.2em;
		font-weight: 600;
	}

	.settings-section {
		margin-bottom: 1.5em;
	}

	.section-header {
		font-size: 0.85em;
		font-weight: 700;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.75em;
		padding-bottom: 0.5em;
		border-bottom: 2px solid var(--color-border-light);
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
	}

	.reset-onboarding-button {
		width: 100%;
		padding: 0.75em 1.2em;
		font-size: 0.9em;
		background: var(--color-info);
		color: var(--color-surface);
		border: none;
		border-radius: 6px;
		box-sizing: border-box; /* Include padding in width calculation */
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s;
	}

	.reset-onboarding-button:hover {
		background: var(--color-info);
		filter: brightness(0.9);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.toggle-button {
		padding: 0.4em 0.8em;
		font-size: 0.85em;
		background: var(--color-info);
		color: var(--color-surface);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.toggle-button:hover {
		background: var(--color-info);
		filter: brightness(0.9);
	}

	/* Collapsible Section */
	.collapsible-section {
		background: var(--color-surface-1);
		border-radius: 6px;
		border-left: 3px solid var(--color-primary);
		overflow: hidden;
	}

	.collapsible-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.75em;
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 1em;
		text-align: left;
		box-sizing: border-box; /* Include padding in width calculation */
		transition: background 0.2s;
	}

	.collapsible-header:hover {
		background: var(--color-hover-overlay);
	}

	.expand-icon {
		font-size: 0.8em;
		color: var(--color-primary);
		transition: transform 0.2s;
	}

	.section-title {
		font-weight: 600;
		color: var(--color-text-secondary);
		flex: 1;
	}

	.collapsible-content {
		padding: 0.5em 0.75em 0.75em;
		border-top: 1px solid var(--color-border-light);
	}

	.empty-state {
		padding: 1em;
		text-align: center;
		color: var(--color-text-tertiary);
		font-style: italic;
	}

	.hint-item {
		display: flex;
		align-items: center;
		gap: 0.75em;
		padding: 0.6em;
		background: var(--color-surface);
		border-radius: 4px;
		margin-bottom: 0.5em;
		border: 1px solid var(--color-border-light);
	}

	.hint-item:last-child {
		margin-bottom: 0;
	}

	.hint-id {
		flex: 1;
		font-family: 'Courier New', monospace;
		color: var(--color-text-secondary);
		font-weight: 500;
		word-break: break-word;
		overflow-wrap: break-word;
		min-width: 0; /* Allow flex item to shrink below content size */
	}

	.hint-status {
		font-size: 0.85em;
		color: var(--color-text-secondary);
	}

	.actions {
		display: flex;
		gap: 0.75em;
		flex-wrap: wrap;
		margin-top: 1.5em;
		padding-top: 1em;
		border-top: 2px solid var(--color-border-light);
	}

	button {
		padding: 0.6em 1.2em;
		font-size: 0.9em;
		font-weight: 600;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.danger {
		background: var(--color-error);
		color: var(--color-surface);
	}

	.danger:hover {
		background: var(--color-error);
		filter: brightness(0.9);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.warning {
		background: var(--color-warning);
		color: var(--color-surface);
	}

	.warning:hover {
		background: var(--color-warning);
		filter: brightness(0.9);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	@media (max-width: 640px) {
		.actions {
			flex-direction: column;
		}

		button {
			width: 100%;
			box-sizing: border-box; /* Include padding in width calculation */
		}
	}
</style>
