<script lang="ts">
	import { settings } from '../stores/settings.svelte'
	import { navigate } from '../lib/router.svelte'

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

	function toggleKeyboardHint() {
		settings.updateSystemPreferences({
			hasSeenKeyboardHint: !settings.hasSeenKeyboardHint,
		})
	}
</script>

<div class="settings-viewer" data-testid="settings-viewer">
	<h3>⚙️ Settings</h3>

	<div class="settings-section">
		<div class="section-header">Feature Settings (Immutable)</div>
		<div class="settings-grid">
			<div class="setting-item">
				<span class="setting-label">Onboarded:</span>
				<span class="setting-value">
					{settings.isOnboarded ? '✅ Yes' : '❌ No'}
				</span>
			</div>
			<div class="setting-item">
				<span class="setting-label">Currency Mode:</span>
				<span class="setting-value">{settings.currencyMode}</span>
			</div>
			<div class="setting-item">
				<span class="setting-label">Default Currency:</span>
				<span class="setting-value">{settings.defaultCurrency}</span>
			</div>
		</div>
	</div>

	<div class="settings-section">
		<div class="section-header">System Preferences (Mutable)</div>
		<div class="settings-grid">
			<div class="setting-item">
				<span class="setting-label">Keyboard Hint Seen:</span>
				<span class="setting-value">
					{settings.hasSeenKeyboardHint ? '✅ Yes' : '❌ No'}
				</span>
				<button class="toggle-button" onclick={toggleKeyboardHint}>Toggle</button>
			</div>
		</div>
	</div>

	<div class="actions">
		<button class="danger" onclick={resetOnboarding}>Reset All Settings</button>
		<button class="warning" onclick={resetSystemPreferences}>Reset System Preferences</button>
	</div>
</div>

<style>
	.settings-viewer {
		padding: 1em;
		border-radius: 8px;
		background: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	h3 {
		margin: 0 0 1em;
		color: #333;
		font-size: 1.2em;
		font-weight: 600;
	}

	.settings-section {
		margin-bottom: 1.5em;
	}

	.section-header {
		font-size: 0.85em;
		font-weight: 700;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.75em;
		padding-bottom: 0.5em;
		border-bottom: 2px solid #e0e0e0;
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75em;
	}

	.setting-item {
		display: flex;
		align-items: center;
		gap: 0.75em;
		padding: 0.75em;
		background: #f9f9f9;
		border-radius: 6px;
		border-left: 3px solid #4caf50;
	}

	.setting-label {
		font-weight: 600;
		color: #555;
		min-width: 150px;
	}

	.setting-value {
		flex: 1;
		font-family: 'Courier New', monospace;
		color: #333;
		background: white;
		padding: 0.4em 0.6em;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	.toggle-button {
		padding: 0.4em 0.8em;
		font-size: 0.85em;
		background: #2196f3;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		transition: background 0.2s;
	}

	.toggle-button:hover {
		background: #1976d2;
	}

	.actions {
		display: flex;
		gap: 0.75em;
		flex-wrap: wrap;
		margin-top: 1.5em;
		padding-top: 1em;
		border-top: 2px solid #e0e0e0;
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
		background: #f44336;
		color: white;
	}

	.danger:hover {
		background: #d32f2f;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
	}

	.warning {
		background: #ff9800;
		color: white;
	}

	.warning:hover {
		background: #f57c00;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
	}

	@media (max-width: 640px) {
		.setting-item {
			flex-direction: column;
			align-items: flex-start;
		}

		.setting-label {
			min-width: unset;
		}

		.setting-value {
			width: 100%;
		}

		.actions {
			flex-direction: column;
		}

		button {
			width: 100%;
		}
	}
</style>
