<script lang="ts">
	import { navigate } from '../lib/router.svelte'
	import { settings } from '../stores/settings.svelte'
	import type { CurrencyMode } from '../stores/settings.svelte'
	import CurrencySelector from './CurrencySelector.svelte'
	import { DEFAULT_CURRENCY } from '../data/currencies'

	let currencyMode = $state<CurrencyMode>('multi')
	let defaultCurrency = $state(DEFAULT_CURRENCY)
	let showCurrencySelector = $state(false)

	/**
	 * Select currency mode and proceed to currency selection if needed
	 */
	function selectCurrencyMode(mode: CurrencyMode) {
		currencyMode = mode
		if (mode === 'single') {
			showCurrencySelector = true
		} else {
			// For multi-currency mode, complete onboarding immediately
			completeOnboarding()
		}
	}

	/**
	 * Complete onboarding with selected settings and navigate to the main app
	 */
	function completeOnboarding() {
		// Save settings to store
		settings.completeOnboarding(currencyMode, defaultCurrency)

		// Navigate to home page
		navigate('/')
	}

	/**
	 * Skip onboarding and use default multi-currency mode
	 */
	function skipOnboarding() {
		currencyMode = 'multi'
		defaultCurrency = DEFAULT_CURRENCY
		completeOnboarding()
	}

	/**
	 * Go back to currency mode selection
	 */
	function goBack() {
		showCurrencySelector = false
	}

	/**
	 * Handle keyboard events for accessibility
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (showCurrencySelector) {
			if (event.key === 'Escape') {
				event.preventDefault()
				goBack()
			} else if (event.key === 'Enter' && currencyMode === 'single') {
				event.preventDefault()
				completeOnboarding()
			}
		} else {
			if (event.key === 'Escape') {
				skipOnboarding()
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="onboarding-container">
	{#if !showCurrencySelector}
		<!-- Step 1: Currency Mode Selection -->
		<h1>Welcome to Trip Settle</h1>
		<p class="tagline">Expense settlement made easy</p>

		<div class="currency-mode-section">
			<h2 class="section-title">How do you want to track expenses?</h2>

			<div class="mode-options">
				<button
					class="mode-option"
					onclick={() => selectCurrencyMode('single')}
					onkeydown={e => {
						if (e.key === 'Enter') {
							e.preventDefault()
							e.stopPropagation()
							selectCurrencyMode('single')
						}
					}}
				>
					<div class="mode-icon">💵</div>
					<div class="mode-title">Single Currency</div>
					<p class="mode-description">All expenses in one currency (simpler)</p>
				</button>

				<button
					class="mode-option"
					onclick={() => selectCurrencyMode('multi')}
					onkeydown={e => {
						if (e.key === 'Enter') {
							e.preventDefault()
							e.stopPropagation()
							selectCurrencyMode('multi')
						}
					}}
				>
					<div class="mode-icon">🌍</div>
					<div class="mode-title">Multiple Currencies</div>
					<p class="mode-description">Track expenses in different currencies</p>
				</button>
			</div>

			<p class="keyboard-hint">
				<span class="hint-icon">⌨️</span>
				Use <kbd>Tab</kbd> to navigate and <kbd>Enter</kbd> to select
			</p>

			<button class="skip-link" onclick={skipOnboarding}>Skip and use multi-currency mode</button>
		</div>

		<p class="keyboard-hint">Press <kbd>Esc</kbd> to skip</p>
	{:else}
		<!-- Step 2: Currency Selection (Single-Currency Mode Only) -->
		<h1>Choose Your Currency</h1>
		<p class="tagline">Select the default currency for all expenses</p>

		<div class="currency-selection">
			<div class="currency-selector-wrapper">
				<label for="default-currency">Default Currency:</label>
				<CurrencySelector bind:value={defaultCurrency} />
			</div>

			<div class="actions">
				<button class="primary" onclick={completeOnboarding}>Continue</button>
				<button class="secondary" onclick={goBack}>Go Back</button>
			</div>
		</div>

		<p class="keyboard-hint">Press <kbd>Enter</kbd> to continue or <kbd>Esc</kbd> to go back</p>
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
		color: #ff3e00;
		font-size: 3rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
	}

	.tagline {
		font-size: 1.5rem;
		color: #666;
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
		transition: all 0.2s;
		font-weight: 500;
	}

	button.primary {
		background-color: #ff3e00;
		color: white;
	}

	button.primary:hover {
		background-color: #e63600;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(255, 62, 0, 0.3);
	}

	button.primary:focus {
		outline: 2px solid #ff3e00;
		outline-offset: 2px;
	}

	button.secondary {
		background-color: transparent;
		color: #666;
		border: 1px solid #ccc;
	}

	button.secondary:hover {
		background-color: #f5f5f5;
		border-color: #999;
	}

	button.secondary:focus {
		outline: 2px solid #666;
		outline-offset: 2px;
	}

	.currency-mode-section {
		margin: 2rem 0;
	}

	.section-title {
		font-size: 1.8rem;
		color: #333;
		margin-bottom: 2rem;
		font-weight: 600;
	}

	.mode-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.mode-option {
		background: white;
		border: 2px solid #e0e0e0;
		border-radius: 12px;
		padding: 2rem;
		cursor: pointer;
		transition: all 0.3s;
		text-align: center;
	}

	.mode-option:hover {
		border-color: #ff3e00;
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgba(255, 62, 0, 0.2);
	}

	.mode-option:focus {
		outline: none;
		border-color: #ff3e00;
		box-shadow:
			0 0 0 3px rgba(255, 62, 0, 0.2),
			0 8px 16px rgba(255, 62, 0, 0.3);
		transform: translateY(-4px);
		animation: focusPulse 2s ease-in-out infinite;
	}

	@keyframes focusPulse {
		0%,
		100% {
			box-shadow:
				0 0 0 3px rgba(255, 62, 0, 0.2),
				0 8px 16px rgba(255, 62, 0, 0.3);
		}
		50% {
			box-shadow:
				0 0 0 5px rgba(255, 62, 0, 0.3),
				0 8px 20px rgba(255, 62, 0, 0.4);
		}
	}

	.mode-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.mode-title {
		font-size: 1.3rem;
		font-weight: 600;
		color: #333;
		margin-bottom: 0.5rem;
	}

	.mode-description {
		font-size: 1rem;
		color: #666;
		margin: 0;
		line-height: 1.4;
	}

	.skip-link {
		background: none;
		border: none;
		color: #999;
		font-size: 0.95rem;
		text-decoration: underline;
		padding: 0.5rem;
		cursor: pointer;
		transition: color 0.2s;
	}

	.skip-link:hover {
		color: #666;
	}

	.currency-selection {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.currency-selector-wrapper {
		margin-bottom: 2rem;
		text-align: left;
	}

	.currency-selector-wrapper label {
		display: block;
		font-size: 1.1rem;
		font-weight: 600;
		color: #333;
		margin-bottom: 0.75rem;
	}

	.keyboard-hint {
		color: #666;
		font-size: 0.95rem;
		margin-top: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.hint-icon {
		font-size: 1.2rem;
	}

	kbd {
		background-color: #f5f5f5;
		border: 1px solid #ccc;
		border-radius: 3px;
		padding: 0.2rem 0.5rem;
		font-family: monospace;
		font-size: 0.85rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		font-weight: 600;
		color: #333;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		h1 {
			font-size: 2rem;
		}

		.tagline {
			font-size: 1.2rem;
		}

		.section-title {
			font-size: 1.4rem;
		}

		.mode-options {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.mode-option {
			padding: 1.5rem;
		}

		.actions {
			flex-direction: column;
		}

		button {
			width: 100%;
		}

		.currency-selection {
			padding: 1rem;
		}
	}
</style>
