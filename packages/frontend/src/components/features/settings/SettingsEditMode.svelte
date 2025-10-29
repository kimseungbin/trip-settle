<script lang="ts">
	import { t } from 'svelte-i18n'
	import CurrencySelector from '../../common/CurrencySelector.svelte'
	import CurrencyModeSelector from '../onboarding/CurrencyModeSelector.svelte'
	import type { CurrencyMode } from '../../../stores/settings.svelte'

	let {
		currencyMode = $bindable<CurrencyMode>('multi'),
		defaultCurrency = $bindable<string>(''),
		showCurrencySelector = $bindable<boolean>(false),
		onSave,
		onCancel,
		onCurrencyModeChange,
	}: {
		currencyMode?: CurrencyMode
		defaultCurrency?: string
		showCurrencySelector?: boolean
		onSave: () => void
		onCancel: () => void
		onCurrencyModeChange: (mode: CurrencyMode) => void
	} = $props()

	/**
	 * Handle currency mode selection
	 */
	function handleModeSelect(mode: CurrencyMode) {
		onCurrencyModeChange(mode)
	}
</script>

<div class="settings-section">
	<h2>{$t('settings.editSettings')}</h2>

	<!-- Currency Mode Selection -->
	<CurrencyModeSelector bind:value={currencyMode} onselect={handleModeSelect} variant="settings" />

	<!-- Currency Selection (for single-currency mode) -->
	{#if showCurrencySelector}
		<div class="currency-selection">
			<h3>{$t('settings.defaultCurrency.label')}</h3>
			<CurrencySelector bind:value={defaultCurrency} autofocus={true} />
		</div>
	{/if}

	<!-- Action Buttons -->
	<div class="actions">
		<button class="primary" onclick={onSave}>{$t('settings.saveButton')}</button>
		<button class="secondary" onclick={onCancel}>{$t('settings.cancelButton')}</button>
	</div>

	<div class="warning-box">
		<p class="warning-icon">⚠️</p>
		<p class="warning-text">{$t('settings.warning')}</p>
	</div>
</div>

<style>
	.settings-section {
		background: var(--color-surface);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: var(--shadow-md);
		margin-bottom: 2rem;
	}

	h2 {
		color: var(--color-text);
		font-size: 1.5rem;
		margin: 0 0 1.5rem;
		font-weight: 600;
	}

	h3 {
		color: var(--color-text-secondary);
		font-size: 1.2rem;
		margin: 1.5rem 0 1rem;
		font-weight: 600;
	}

	.currency-selection {
		margin-bottom: 2rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	button {
		padding: 0.75rem 2rem;
		font-size: 1.1rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition:
			all var(--transition-fast),
			transform var(--transition-fast);
		font-weight: 500;
	}

	button.primary {
		background-color: var(--color-primary);
		color: var(--color-surface);
	}

	button.primary:hover {
		background-color: var(--color-primary-hover);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	button.primary:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	button.secondary {
		background-color: transparent;
		color: var(--color-text-secondary);
		border: 2px solid var(--color-border-dark);
	}

	button.secondary:hover {
		background-color: var(--color-surface-1);
		border-color: var(--color-text-tertiary);
	}

	button.secondary:focus {
		outline: 2px solid var(--color-text-secondary);
		outline-offset: 2px;
	}

	.warning-box {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 2rem;
		align-items: flex-start;
		background: var(--color-warning-light);
		border-left: 4px solid var(--color-warning);
	}

	.warning-icon {
		font-size: 1.5rem;
		margin: 0;
	}

	.warning-text {
		margin: 0;
		color: var(--color-text-secondary);
		line-height: 1.6;
		flex: 1;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.settings-section {
			padding: 1.5rem;
		}

		.actions {
			flex-direction: column;
		}

		button {
			width: 100%;
			box-sizing: border-box;
		}
	}
</style>
