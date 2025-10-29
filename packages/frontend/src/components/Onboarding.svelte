<script lang="ts">
	import { navigate } from '../lib/router.svelte'
	import { settings } from '../stores/settings.svelte'
	import type { CurrencyMode } from '../stores/settings.svelte'
	import CurrencySelector from './CurrencySelector.svelte'
	import LanguageSelector from './LanguageSelector.svelte'
	import { DEFAULT_CURRENCY, getCurrencyByCode } from '../data/currencies'
	import { onMount } from 'svelte'
	import { t } from 'svelte-i18n'
	import { toast } from '../stores/toast.svelte'
	import type { PaymentMode } from '../stores/settings.svelte'
	import { focusElement } from '../lib/focus'
	import { ANIMATION_DURATION, TOAST_TIMING } from '../constants/timing'

	let currencyMode = $state<CurrencyMode>('multi')
	let defaultCurrency = $state(DEFAULT_CURRENCY)
	let paymentMode = $state<PaymentMode>('single')
	let payers = $state<string[]>([])
	let showCurrencySelector = $state(false)
	let showPaymentModeSelector = $state(false)
	let showPayerCollection = $state(false)
	let firstButton = $state<HTMLButtonElement | undefined>(undefined)
	let expandedMode = $state<'single' | 'multi' | null>(null)
	let payerInput = $state<HTMLInputElement | undefined>(undefined)
	let payerListContainer = $state<HTMLDivElement | undefined>(undefined)
	let lastAddedPayer = $state<string | null>(null)

	/**
	 * Focus the first interactive element on mount for keyboard accessibility
	 */
	onMount(() => {
		focusElement(firstButton)
	})

	/**
	 * Focus the payer input when the payer collection screen is shown
	 */
	$effect(() => {
		if (showPayerCollection && payerInput) {
			focusElement(payerInput)
		}
	})

	/**
	 * Add a new payer to the list
	 */
	function addPayer(name: string) {
		if (name && !payers.includes(name)) {
			payers = [name, ...payers]
			lastAddedPayer = name
			// Scroll to top to show the newly added item
			setTimeout(() => {
				if (payerListContainer) {
					payerListContainer.scrollTop = 0
				}
			}, 0)
			// Clear the animation marker after animation completes
			setTimeout(() => {
				lastAddedPayer = null
			}, ANIMATION_DURATION.FAST)
		}
	}

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

	/**
	 * Handle keydown on payer input (Enter to add)
	 */
	function handlePayerInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault()
			const input = e.currentTarget as HTMLInputElement
			const name = input.value.trim()
			addPayer(name)
			input.value = ''
			focusElement(input)
		}
	}

	/**
	 * Handle add payer button click
	 */
	function handleAddPayerClick() {
		if (payerInput) {
			const name = payerInput.value.trim()
			addPayer(name)
			payerInput.value = ''
			focusElement(payerInput)
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

		<div class="payer-collection">
			<div class="payer-list" bind:this={payerListContainer}>
				{#if payers.length === 0}
					<p class="empty-state">No payers added yet. Add at least 1 payer to continue.</p>
				{:else}
					<ul>
						{#each payers as payer, index}
							<li class:newly-added={payer === lastAddedPayer}>
								<span class="payer-name">{payer}</span>
								<button
									class="remove-btn"
									onclick={() => {
										payers = payers.filter((_, i) => i !== index)
									}}
								>
									✕
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="payer-input">
				<input
					bind:this={payerInput}
					type="text"
					placeholder="Enter payer name"
					onkeydown={handlePayerInputKeydown}
				/>
				<button onclick={handleAddPayerClick}>Add</button>
			</div>

			<div class="actions">
				<button class="secondary" onclick={goBack}>Back</button>
				<button onclick={completeOnboarding} disabled={payers.length < 1} class:disabled={payers.length < 1}>
					Complete
				</button>
			</div>
		</div>

		<p class="keyboard-hint">Press <kbd>Esc</kbd> to go back • Add at least 1 payer to continue</p>
	{:else if showPaymentModeSelector}
		<!-- Step 3: Payment Mode Selection -->
		<h1>Payment Mode</h1>
		<p class="tagline">Choose how expenses will be tracked</p>

		<div class="currency-mode-section">
			<h2 class="section-title">Select Payment Mode</h2>

			<div class="mode-options">
				<div class="mode-card">
					<button class="mode-option" tabindex="0" onclick={() => selectPaymentMode('single')}>
						<div class="mode-icon">👤</div>
						<div class="mode-title">Single Payer</div>
						<p class="mode-description desktop-only">All expenses paid by one person</p>
					</button>
				</div>

				<div class="mode-card">
					<button class="mode-option" tabindex="0" onclick={() => selectPaymentMode('multi')}>
						<div class="mode-icon">👥</div>
						<div class="mode-title">Multiple Payers</div>
						<p class="mode-description desktop-only">Track who paid for each expense</p>
					</button>
				</div>
			</div>

			<button class="skip-link" tabindex="0" onclick={skipOnboarding}>Skip</button>
		</div>

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

		<div class="currency-mode-section">
			<h2 class="section-title">{$t('onboarding.currencyModeTitle')}</h2>

			<div class="mode-options">
				<div class="mode-card">
					<button
						bind:this={firstButton}
						class="mode-option"
						tabindex="0"
						onclick={() => selectCurrencyMode('single')}
						onkeydown={e => {
							if (e.key === 'Enter') {
								e.preventDefault()
								e.stopPropagation()
								selectCurrencyMode('single')
							}
						}}
					>
						<div class="mode-icon">{$t('onboarding.singleCurrency.icon')}</div>
						<div class="mode-title">{$t('onboarding.singleCurrency.title')}</div>
						<p class="mode-description desktop-only">{$t('onboarding.singleCurrency.description')}</p>
					</button>
					{#if expandedMode === 'single'}
						<p class="mode-description mobile-only">{$t('onboarding.singleCurrency.description')}</p>
					{/if}
					<button
						class="show-more-btn mobile-only"
						onclick={e => {
							e.stopPropagation()
							expandedMode = expandedMode === 'single' ? null : 'single'
						}}
					>
						{expandedMode === 'single' ? $t('onboarding.showLess') : $t('onboarding.showMore')}
					</button>
				</div>

				<div class="mode-card">
					<button
						class="mode-option"
						tabindex="0"
						onclick={() => selectCurrencyMode('multi')}
						onkeydown={e => {
							if (e.key === 'Enter') {
								e.preventDefault()
								e.stopPropagation()
								selectCurrencyMode('multi')
							}
						}}
					>
						<div class="mode-icon">{$t('onboarding.multiCurrency.icon')}</div>
						<div class="mode-title">{$t('onboarding.multiCurrency.title')}</div>
						<p class="mode-description desktop-only">{$t('onboarding.multiCurrency.description')}</p>
					</button>
					{#if expandedMode === 'multi'}
						<p class="mode-description mobile-only">{$t('onboarding.multiCurrency.description')}</p>
					{/if}
					<button
						class="show-more-btn mobile-only"
						onclick={e => {
							e.stopPropagation()
							expandedMode = expandedMode === 'multi' ? null : 'multi'
						}}
					>
						{expandedMode === 'multi' ? $t('onboarding.showLess') : $t('onboarding.showMore')}
					</button>
				</div>
			</div>

			<p class="keyboard-hint">
				<span class="hint-icon">{$t('onboarding.keyboardHint.icon')}</span>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html $t('onboarding.keyboardHint.navigate', {
					values: {
						tab: `<kbd>${$t('keyboard.tab')}</kbd>`,
						enter: `<kbd>${$t('keyboard.enter')}</kbd>`,
					},
				})}
			</p>

			<button class="skip-link" tabindex="0" onclick={skipOnboarding}>{$t('onboarding.skipButton')}</button>
		</div>

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

	.currency-mode-section {
		margin: 2rem 0;
	}

	.section-title {
		font-size: 1.8rem;
		color: var(--color-text);
		margin-bottom: 2rem;
		font-weight: 600;
	}

	.mode-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.mode-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		height: 100%;
	}

	/* Mobile: Prevent grid from stretching cards when one expands */
	@media (max-width: 640px) {
		.mode-options {
			align-items: start;
		}

		.mode-card {
			height: auto;
		}
	}

	.mode-option {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 2rem;
		cursor: pointer;
		transition:
			all var(--transition-normal),
			transform var(--transition-fast);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 100%;
		min-height: 320px;
	}

	.mode-option:hover {
		border-color: var(--color-primary);
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.mode-option:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow:
			0 0 0 3px var(--color-primary-alpha-20),
			var(--shadow-lg);
		transform: translateY(-4px);
		animation: focusPulse 2s ease-in-out infinite;
	}

	@keyframes focusPulse {
		0%,
		100% {
			box-shadow:
				0 0 0 3px var(--color-primary-alpha-20),
				var(--shadow-lg);
		}
		50% {
			box-shadow:
				0 0 0 5px var(--color-primary-alpha-30),
				var(--shadow-xl);
		}
	}

	.mode-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.mode-title {
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.5rem;
		white-space: pre-line; /* Allow newlines in title text */
	}

	.mode-description {
		font-size: 1rem;
		color: var(--color-text-secondary);
		margin: 0;
		padding: 0 1rem;
		line-height: 1.6;
		white-space: pre-line;
		text-align: left;
		animation: slideDown 0.2s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.show-more-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: 0.9rem;
		padding: 0.5rem;
		cursor: pointer;
		text-decoration: underline;
		transition: color var(--transition-fast);
		font-weight: 500;
	}

	.show-more-btn:hover {
		color: var(--color-primary-hover);
	}

	.show-more-btn:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
		border-radius: 4px;
	}

	/* Desktop: Always show descriptions, hide show more button */
	.mobile-only {
		display: none;
	}

	.desktop-only {
		display: block;
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
	.hint-icon {
		font-size: 1.2rem;
	}

	/* Payer collection styles */
	.payer-collection {
		max-width: 500px;
		margin: 0 auto;
		padding: 2rem;
	}

	.payer-list {
		margin-bottom: 1.5rem;
		min-height: 80px;
		max-height: 200px;
		overflow-y: auto;
	}

	.payer-list ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.payer-list li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		margin-bottom: 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
	}

	.payer-list li.newly-added {
		animation: slideInFromTop 0.3s ease-out;
	}

	@keyframes slideInFromTop {
		from {
			opacity: 0;
			transform: translateY(-10px);
			background: var(--color-primary-alpha-20);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			background: var(--color-surface);
		}
	}

	.payer-name {
		font-weight: 500;
		color: var(--color-text);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.remove-btn {
		padding: 0.25rem 0.5rem;
		font-size: 1rem;
		background: transparent;
		color: var(--color-text-tertiary);
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all var(--transition-fast);
		min-width: 32px;
		flex-shrink: 0;
	}

	.remove-btn:hover {
		background: var(--color-error);
		color: var(--color-surface);
		border-color: var(--color-error);
	}

	/* Mobile: Smaller remove button */
	@media (max-width: 640px) {
		.remove-btn {
			padding: 0.2rem 0.4rem;
			font-size: 0.9rem;
			min-width: 28px;
			max-width: 28px;
		}

		.payer-list li {
			padding: 0.6rem 0.8rem;
			gap: 0.5rem;
		}

		.payer-name {
			min-width: 0;
		}
	}

	.empty-state {
		text-align: center;
		color: var(--color-text-tertiary);
		font-style: italic;
		padding: 2rem;
	}

	.payer-input {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.payer-input input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}

	.payer-input button {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: var(--color-surface);
		box-sizing: border-box;
	}

	.payer-input button:hover {
		background: var(--color-primary-hover);
	}

	button.disabled,
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button.disabled:hover,
	button:disabled:hover {
		background-color: var(--color-surface-1);
		transform: none;
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
		/* Mobile: Hide desktop descriptions, show expandable pattern */
		.desktop-only {
			display: none;
		}

		.mobile-only {
			display: block;
		}

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

		.section-title {
			font-size: 1.3rem;
			margin-bottom: 1.25rem;
		}

		.mode-options {
			grid-template-columns: 1fr 1fr;
			gap: 0.75rem;
		}

		.mode-card {
			display: flex;
			flex-direction: column;
			min-height: 200px; /* Ensure equal height for collapsed cards */
		}

		.mode-option {
			padding: 1rem 0.75rem;
			min-height: auto;
			flex-shrink: 0; /* Prevent button from shrinking */
		}

		.mode-icon {
			font-size: 2.5rem;
			margin-bottom: 0.5rem;
		}

		.mode-title {
			font-size: 1rem;
			margin-bottom: 0.25rem;
			line-height: 1.3;
		}

		.mode-description {
			font-size: 0.85rem;
			line-height: 1.4;
			padding: 0 0.5rem;
		}

		.show-more-btn {
			font-size: 0.8rem;
			padding: 0.25rem;
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

		.payer-collection {
			padding: 1rem;
		}

		.payer-list,
		.payer-input,
		.actions {
			width: 100%;
			box-sizing: border-box;
		}

		.payer-input button {
			width: auto;
			flex-shrink: 0;
		}

		.payer-input input {
			min-width: 0;
		}
	}
</style>
