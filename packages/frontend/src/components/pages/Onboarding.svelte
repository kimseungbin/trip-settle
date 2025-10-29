<script lang="ts">
	import { navigate } from '../../lib/router.svelte'
	import { settings } from '../../stores/settings.svelte'
	import type { CurrencyMode } from '../../stores/settings.svelte'
	import CurrencySelector from '../common/CurrencySelector.svelte'
	import LanguageSelector from '../features/onboarding/LanguageSelector.svelte'
	import CurrencyModeSelector from '../features/onboarding/CurrencyModeSelector.svelte'
	import PaymentModeSelector from '../features/onboarding/PaymentModeSelector.svelte'
	import PayerCollector from '../features/onboarding/PayerCollector.svelte'
	import { DEFAULT_CURRENCY, getCurrencyByCode } from '../../data/currencies'
	import { onMount } from 'svelte'
	import { t } from 'svelte-i18n'
	import { toast } from '../../stores/toast.svelte'
	import type { PaymentMode } from '../../stores/settings.svelte'
	import { focusElement } from '../../lib/focus'
	import { TOAST_TIMING } from '../../constants/timing'

	let currencyMode = $state<CurrencyMode>('multi')
	let defaultCurrency = $state(DEFAULT_CURRENCY)
	let paymentMode = $state<PaymentMode>('single')
	let payers = $state<string[]>([])
	let showCurrencySelector = $state(false)
	let showPaymentModeSelector = $state(false)
	let showPayerCollection = $state(false)
	let firstButton = $state<HTMLButtonElement | undefined>(undefined)

	/**
	 * Focus the first interactive element on mount for keyboard accessibility
	 */
	onMount(() => {
		focusElement(firstButton)
	})

	/**
	 * Select currency mode and proceed to payment mode selection
	 */
	function selectCurrencyMode(mode: CurrencyMode) {
		currencyMode = mode
		if (mode === 'single') {
			showCurrencySelector = true
		} else {
			// For multi-currency mode, proceed to payment mode selection
			showPaymentModeSelector = true
		}
	}

	/**
	 * Select payment mode and proceed accordingly
	 */
	function selectPaymentMode(mode: PaymentMode) {
		paymentMode = mode
		if (mode === 'multi') {
			showPayerCollection = true
		} else {
			// For single-payer mode, complete onboarding immediately
			completeOnboarding()
		}
	}

	/**
	 * Complete onboarding with selected settings and navigate to the main app
	 */
	function completeOnboarding() {
		// Save settings to store
		settings.completeOnboarding(currencyMode, defaultCurrency, paymentMode, payers)

		// Show toast notification if single currency mode with custom currency
		if (currencyMode === 'single' && defaultCurrency !== DEFAULT_CURRENCY) {
			const currency = getCurrencyByCode(defaultCurrency)
			const currencyDisplay = currency ? `${currency.code}` : defaultCurrency
			toast.success(
				$t('toast.currencySelected', { values: { currency: currencyDisplay } }),
				TOAST_TIMING.CURRENCY_SUCCESS
			)
		}

		// Navigate to home page
		navigate('/')
	}

	/**
	 * Skip onboarding and use default multi-currency, single-payer mode
	 */
	function skipOnboarding() {
		currencyMode = 'multi'
		defaultCurrency = DEFAULT_CURRENCY
		paymentMode = 'single'
		payers = []
		completeOnboarding()
	}

	/**
	 * After currency selection, proceed to payment mode selection
	 */
	function onCurrencySelected() {
		showPaymentModeSelector = true
	}

	/**
	 * Go back to currency mode selection or payment mode selection
	 */
	function goBack() {
		if (showPayerCollection) {
			showPayerCollection = false
			showPaymentModeSelector = true
		} else if (showPaymentModeSelector) {
			showPaymentModeSelector = false
			showCurrencySelector = false
		} else if (showCurrencySelector) {
			showCurrencySelector = false
		}
	}

	/**
	 * Handle keyboard events for accessibility
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (showPayerCollection || showPaymentModeSelector || showCurrencySelector) {
				event.preventDefault()
				goBack()
			} else {
				skipOnboarding()
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="onboarding-container">
	<!-- Language Selector -->
	<LanguageSelector />

	{#if showPayerCollection}
		<!-- Step 4: Payer Collection (Multi-Payer Mode Only) -->
		<h1>Add Payers</h1>
		<p class="tagline">Enter names of people who will be paying for expenses</p>

		<PayerCollector bind:payers onComplete={completeOnboarding} onBack={goBack} autofocus={true} />

		<p class="keyboard-hint">Press <kbd>Esc</kbd> to go back • Add at least 1 payer to continue</p>
	{:else if showPaymentModeSelector}
		<!-- Step 3: Payment Mode Selection -->
		<h1>Payment Mode</h1>
		<p class="tagline">Choose how expenses will be tracked</p>

		<PaymentModeSelector bind:value={paymentMode} onselect={selectPaymentMode} />

		<button class="skip-link" tabindex="0" onclick={skipOnboarding}>Skip</button>

		<p class="keyboard-hint">Press <kbd>Esc</kbd> to go back</p>
	{:else if showCurrencySelector}
		<!-- Step 2: Currency Selection (Single-Currency Mode Only) -->
		<h1>{$t('onboarding.currencySelection.title')}</h1>
		<p class="tagline">{$t('onboarding.currencySelection.tagline')}</p>

		<div class="currency-selection">
			<p class="currency-keyboard-hint">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html $t('onboarding.currencySelection.keyboardHintSimple', {
					values: {
						up: `<kbd>${$t('keyboard.up')}</kbd>`,
						down: `<kbd>${$t('keyboard.down')}</kbd>`,
						enter: `<kbd>${$t('keyboard.enter')}</kbd>`,
						esc: `<kbd>${$t('keyboard.esc')}</kbd>`,
					},
				})}
			</p>

			<div class="currency-selector-wrapper">
				<label for="default-currency">{$t('onboarding.currencySelection.label')}</label>
				<CurrencySelector
					bind:value={defaultCurrency}
					autofocus={true}
					initialOpen={true}
					onselect={onCurrencySelected}
				/>
			</div>

			<div class="actions">
				<button class="secondary" onclick={goBack}>{$t('onboarding.currencySelection.backButton')}</button>
			</div>
		</div>

		<p class="keyboard-hint">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $t('onboarding.currencySelection.bottomHintSimple', {
				values: {
					esc: `<kbd>${$t('keyboard.esc')}</kbd>`,
				},
			})}
		</p>
	{:else}
		<!-- Step 1: Currency Mode Selection -->
		<h1>{$t('onboarding.welcome')}</h1>
		<p class="tagline">{$t('onboarding.tagline')}</p>

		<CurrencyModeSelector bind:value={currencyMode} onselect={selectCurrencyMode} autofocus={true} />

		<button class="skip-link" tabindex="0" onclick={skipOnboarding}>{$t('onboarding.skipButton')}</button>

		<p class="keyboard-hint">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $t('onboarding.keyboardHint.skip', {
				values: { esc: `<kbd>${$t('keyboard.esc')}</kbd>` },
			})}
		</p>
	{/if}
</div>

<style>
	.onboarding-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		color: var(--color-primary);
		font-size: 3rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
	}

	.tagline {
		font-size: 1.5rem;
		color: var(--color-text-secondary);
		margin-bottom: 3rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	button {
		padding: 0.75rem 2rem;
		font-size: 1.1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition:
			all var(--transition-fast),
			transform var(--transition-fast);
		font-weight: 500;
	}

	button.secondary {
		background-color: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border-dark);
	}

	button.secondary:hover {
		background-color: var(--color-surface-1);
		border-color: var(--color-text-tertiary);
	}

	button.secondary:focus {
		outline: 2px solid var(--color-text-secondary);
		outline-offset: 2px;
	}

	.skip-link {
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		font-size: 0.95rem;
		text-decoration: underline;
		padding: 0.5rem;
		cursor: pointer;
		transition: color var(--transition-fast);
	}

	.skip-link:hover {
		color: var(--color-text-secondary);
	}

	.currency-selection {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.currency-selector-wrapper {
		margin-bottom: 24rem;
		text-align: left;
	}

	.currency-selector-wrapper label {
		display: block;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.75rem;
	}

	.keyboard-hint {
		color: var(--color-text-secondary);
		font-size: 0.95rem;
		margin-top: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.currency-keyboard-hint {
		color: var(--color-text-secondary);
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Hide keyboard hints on mobile */
	@media (max-width: 640px) {
		.keyboard-hint,
		.currency-keyboard-hint {
			display: none;
		}
	}

	/* Keyboard key styles are now injected via {@html} in translations */
	:global(.keyboard-hint kbd),
	:global(.currency-keyboard-hint kbd) {
		background-color: var(--color-surface-1);
		border: 1px solid var(--color-border-dark);
		border-radius: 3px;
		padding: 0.2rem 0.5rem;
		font-family: monospace;
		font-size: 0.85rem;
		box-shadow: var(--shadow-sm);
		font-weight: 600;
		color: var(--color-text);
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.onboarding-container {
			padding: 1.5rem 1rem;
		}

		h1 {
			font-size: 1.8rem;
			margin-bottom: 0.25rem;
		}

		.tagline {
			font-size: 1.1rem;
			margin-bottom: 2rem;
		}

		.actions {
			flex-direction: column;
		}

		button {
			width: 100%;
			box-sizing: border-box; /* Include padding in width calculation */
		}

		.currency-selection {
			padding: 1rem;
		}
	}
</style>
