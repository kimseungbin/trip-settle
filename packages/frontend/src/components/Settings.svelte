<script lang="ts">
	import { navigate } from '../lib/router.svelte'
	import { settings } from '../stores/settings.svelte'
	import type { CurrencyMode } from '../stores/settings.svelte'
	import CurrencySelector from './CurrencySelector.svelte'
	import { t, locale } from 'svelte-i18n'
	import { setLocale } from '../i18n'

	// Current settings (reactive)
	const currencyMode = $derived(settings.currencyMode)
	const defaultCurrency = $derived(settings.defaultCurrency)
	const currentLocale = $derived($locale)

	// Local state for editing
	let editMode = $state(false)
	let newCurrencyMode = $state<CurrencyMode>('multi')
	let newDefaultCurrency = $state('')
	let showCurrencySelector = $state(false)

	/**
	 * Initialize edit mode with current settings
	 */
	function startEditing() {
		newCurrencyMode = currencyMode
		newDefaultCurrency = defaultCurrency
		showCurrencySelector = newCurrencyMode === 'single'
		editMode = true
	}

	/**
	 * Cancel editing and discard changes
	 */
	function cancelEditing() {
		editMode = false
		showCurrencySelector = false
	}

	/**
	 * Save settings changes
	 * This will reset the app and re-run onboarding flow
	 */
	function saveChanges() {
		// Reset settings to trigger onboarding again
		settings.resetSettings()
		// Complete onboarding with new settings
		settings.completeOnboarding(newCurrencyMode, newDefaultCurrency)
		// Navigate to home to see changes take effect
		navigate('/')
		editMode = false
	}

	/**
	 * Handle currency mode selection
	 */
	function selectCurrencyMode(mode: CurrencyMode) {
		newCurrencyMode = mode
		showCurrencySelector = mode === 'single'
	}

	/**
	 * Handle keyboard shortcuts
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && editMode) {
			event.preventDefault()
			cancelEditing()
		}
	}

	/**
	 * Navigate back to home
	 */
	function goBack() {
		navigate('/')
	}

	/**
	 * Handle language change
	 */
	function handleLanguageChange(event: Event) {
		const target = event.target as HTMLSelectElement
		const value = target.value as 'en' | 'ko'
		setLocale(value)
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="settings-container">
	<!-- Header -->
	<div class="header">
		<button class="back-button" onclick={goBack} aria-label={$t('settings.backButton')}>
			← {$t('settings.backButton')}
		</button>
		<h1>{$t('settings.title')}</h1>
		<p class="tagline">{$t('settings.tagline')}</p>
	</div>

	{#if !editMode}
		<!-- View Mode: Display current settings -->
		<div class="settings-section">
			<h2>{$t('settings.currentSettings')}</h2>

			<div class="setting-item">
				<span class="setting-label">{$t('settings.currencyMode.label')}</span>
				<span class="setting-value">
					{#if currencyMode === 'single'}
						💵 {$t('settings.currencyMode.single')}
					{:else}
						🌍 {$t('settings.currencyMode.multi')}
					{/if}
				</span>
			</div>

			<div class="setting-item">
				<span class="setting-label">{$t('settings.defaultCurrency.label')}</span>
				<span class="setting-value">{defaultCurrency}</span>
			</div>

			<div class="setting-item">
				<span class="setting-label">{$t('settings.language.label')}</span>
				<select class="language-dropdown" value={currentLocale} onchange={handleLanguageChange}>
					<option value="en">🇺🇸 English</option>
					<option value="ko">🇰🇷 한국어</option>
				</select>
			</div>

			<div class="actions">
				<button class="primary" onclick={startEditing}>{$t('settings.editButton')}</button>
			</div>

			<div class="info-box">
				<p class="info-icon">ℹ️</p>
				<p class="info-text">{$t('settings.info')}</p>
			</div>
		</div>
	{:else}
		<!-- Edit Mode: Allow changing settings -->
		<div class="settings-section">
			<h2>{$t('settings.editSettings')}</h2>

			<!-- Currency Mode Selection -->
			<div class="mode-selection">
				<h3>{$t('settings.currencyMode.label')}</h3>
				<div class="mode-options">
					<button
						class="mode-option"
						class:selected={newCurrencyMode === 'single'}
						onclick={() => selectCurrencyMode('single')}
					>
						<div class="mode-icon">💵</div>
						<div class="mode-title">{$t('settings.currencyMode.single')}</div>
						<p class="mode-description">{$t('settings.currencyMode.singleDesc')}</p>
					</button>

					<button
						class="mode-option"
						class:selected={newCurrencyMode === 'multi'}
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
					<CurrencySelector bind:value={newDefaultCurrency} autofocus={true} />
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="actions">
				<button class="primary" onclick={saveChanges}>{$t('settings.saveButton')}</button>
				<button class="secondary" onclick={cancelEditing}>{$t('settings.cancelButton')}</button>
			</div>

			<div class="warning-box">
				<p class="warning-icon">⚠️</p>
				<p class="warning-text">{$t('settings.warning')}</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.settings-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.back-button {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: 1rem;
		cursor: pointer;
		padding: 0.5rem 1rem;
		margin-bottom: 1rem;
		transition: color var(--transition-fast);
	}

	.back-button:hover {
		color: var(--color-primary);
	}

	.back-button:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
		border-radius: 4px;
	}

	h1 {
		color: var(--color-primary);
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
	}

	.tagline {
		font-size: 1.2rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

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

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--color-surface-1);
		border-radius: 8px;
		margin-bottom: 1rem;
		border-left: 4px solid var(--color-primary);
	}

	.setting-label {
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.setting-value {
		font-family: 'Courier New', monospace;
		color: var(--color-text);
		background: var(--color-surface);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid var(--color-border);
	}

	.language-dropdown {
		font-family: inherit;
		font-size: 1rem;
		color: var(--color-text);
		background: var(--color-surface);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all var(--transition-fast);
		min-width: 150px;
	}

	.language-dropdown:hover {
		border-color: var(--color-primary);
	}

	.language-dropdown:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
		border-color: var(--color-primary);
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

	.info-box,
	.warning-box {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 2rem;
		align-items: flex-start;
	}

	.info-box {
		background: var(--color-success-light);
		border-left: 4px solid var(--color-success);
	}

	.warning-box {
		background: var(--color-warning-light);
		border-left: 4px solid var(--color-warning);
	}

	.info-icon,
	.warning-icon {
		font-size: 1.5rem;
		margin: 0;
	}

	.info-text,
	.warning-text {
		margin: 0;
		color: var(--color-text-secondary);
		line-height: 1.6;
		flex: 1;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.settings-container {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.tagline {
			font-size: 1rem;
		}

		.settings-section {
			padding: 1.5rem;
		}

		.mode-options {
			grid-template-columns: 1fr;
		}

		.setting-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
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
