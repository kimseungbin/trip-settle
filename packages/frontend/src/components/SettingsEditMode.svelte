<script lang="ts">
	import { t } from 'svelte-i18n'
	import CurrencySelector from './CurrencySelector.svelte'
	import type { CurrencyMode } from '../stores/settings.svelte'

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
	function selectCurrencyMode(mode: CurrencyMode) {
		currencyMode = mode
		onCurrencyModeChange(mode)
	}
</script>

<div class="settings-section">
	<h2>{$t('settings.editSettings')}</h2>

	<!-- Currency Mode Selection -->
	<div class="mode-selection">
		<h3>{$t('settings.currencyMode.label')}</h3>
		<div class="mode-options">
			<button
				class="mode-option"
				class:selected={currencyMode === 'single'}
				onclick={() => selectCurrencyMode('single')}
			>
				<div class="mode-icon">💵</div>
				<div class="mode-title">{$t('settings.currencyMode.single')}</div>
				<p class="mode-description">{$t('settings.currencyMode.singleDesc')}</p>
			</button>

			<button
				class="mode-option"
				class:selected={currencyMode === 'multi'}
				onclick={() => selectCurrencyMode('multi')}
			>
				<div class="mode-icon">🌍</div>
				<div class="mode-title">{$t('settings.currencyMode.multi')}</div>
				<p class="mode-description">{$t('settings.currencyMode.multiDesc')}</p>
			</button>
		</div>
	</div>

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

	.mode-selection {
		margin-bottom: 2rem;
	}

	.mode-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.mode-option {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 1.5rem;
		cursor: pointer;
		transition:
			all var(--transition-normal),
			transform var(--transition-fast);
		text-align: center;
	}

	.mode-option:hover {
		border-color: var(--color-primary);
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.mode-option.selected {
		border-color: var(--color-primary);
		background: var(--color-primary-light);
		box-shadow: var(--shadow-lg);
	}

	.mode-option:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-primary-alpha-20);
	}

	.mode-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.mode-title {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.mode-description {
		font-size: 0.95rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.4;
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

		.mode-options {
			grid-template-columns: 1fr;
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
