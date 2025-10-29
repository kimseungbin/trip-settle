<script lang="ts">
	import { navigate } from '../lib/router.svelte'
	import { settings } from '../stores/settings.svelte'
	import type { CurrencyMode } from '../stores/settings.svelte'
	import SettingsViewMode from './SettingsViewMode.svelte'
	import SettingsEditMode from './SettingsEditMode.svelte'
	import { t, locale } from 'svelte-i18n'

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
		// Complete onboarding with new settings (preserve current payment mode and payers)
		settings.completeOnboarding(newCurrencyMode, newDefaultCurrency, settings.paymentMode, settings.payers)
		// Navigate to home to see changes take effect
		navigate('/')
		editMode = false
	}

	/**
	 * Handle currency mode selection
	 */
	function handleCurrencyModeChange(mode: CurrencyMode) {
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
		<SettingsViewMode {currencyMode} {defaultCurrency} {currentLocale} onEdit={startEditing} />
	{:else}
		<SettingsEditMode
			bind:currencyMode={newCurrencyMode}
			bind:defaultCurrency={newDefaultCurrency}
			bind:showCurrencySelector
			onSave={saveChanges}
			onCancel={cancelEditing}
			onCurrencyModeChange={handleCurrencyModeChange}
		/>
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
	}
</style>
