<script lang="ts">
	import { navigate } from '../lib/router.svelte'
	import { settings } from '../stores/settings.svelte'
	import type { CurrencyMode } from '../stores/settings.svelte'
	import CurrencySelector from './CurrencySelector.svelte'
	import { DEFAULT_CURRENCY } from '../data/currencies'
	import { onMount } from 'svelte'
	import { locale, t } from 'svelte-i18n'
	import { setLocale } from '../i18n'

	let currencyMode = $state<CurrencyMode>('multi')
	let defaultCurrency = $state(DEFAULT_CURRENCY)
	let showCurrencySelector = $state(false)
	let firstButton = $state<HTMLButtonElement | undefined>(undefined)

	/**
	 * Focus the first interactive element on mount for keyboard accessibility
	 */
	onMount(() => {
		firstButton?.focus()
	})

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
			} else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && currencyMode === 'single') {
				// Ctrl/Cmd+Enter to continue (doesn't conflict with currency selector's Enter key)
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
	<!-- Language Selector -->
	<div class="language-selector">
		<button
			class="language-option"
			class:active={$locale === 'en'}
			onclick={() => setLocale('en')}
			aria-label="Switch to English"
		>
			English
		</button>
		<span class="language-divider">|</span>
		<button
			class="language-option"
			class:active={$locale === 'ko'}
			onclick={() => setLocale('ko')}
			aria-label="한국어로 전환"
		>
			한국어
		</button>
	</div>

	{#if !showCurrencySelector}
		<!-- Step 1: Currency Mode Selection -->
		<h1>{$t('onboarding.welcome')}</h1>
		<p class="tagline">{$t('onboarding.tagline')}</p>

		<div class="currency-mode-section">
			<h2 class="section-title">{$t('onboarding.currencyModeTitle')}</h2>

			<div class="mode-options">
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
					<p class="mode-description">{$t('onboarding.singleCurrency.description')}</p>
				</button>

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
					<p class="mode-description">{$t('onboarding.multiCurrency.description')}</p>
				</button>
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
	{:else}
		<!-- Step 2: Currency Selection (Single-Currency Mode Only) -->
		<h1>{$t('onboarding.currencySelection.title')}</h1>
		<p class="tagline">{$t('onboarding.currencySelection.tagline')}</p>

		<div class="currency-selection">
			<p class="currency-keyboard-hint">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html $t('onboarding.currencySelection.keyboardHint', {
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
				<CurrencySelector bind:value={defaultCurrency} autofocus={true} initialOpen={true} />
			</div>

			<div class="actions">
				<button class="primary" onclick={completeOnboarding}
					>{$t('onboarding.currencySelection.continueButton')}</button
				>
				<button class="secondary" onclick={goBack}>{$t('onboarding.currencySelection.backButton')}</button>
			</div>
		</div>

		<p class="keyboard-hint">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $t('onboarding.currencySelection.bottomHint', {
				values: {
					ctrl: `<kbd>${$t('keyboard.ctrl')}</kbd>`,
					enter: `<kbd>${$t('keyboard.enter')}</kbd>`,
					tab: `<kbd>${$t('keyboard.tab')}</kbd>`,
					esc: `<kbd>${$t('keyboard.esc')}</kbd>`,
				},
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

	.language-selector {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
		padding: 0.5rem 0;
	}

	.language-option {
		background: none;
		border: none;
		color: #999;
		font-size: 0.95rem;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
		border-radius: 4px;
		font-weight: 500;
	}

	.language-option:hover {
		color: #666;
		background-color: #f5f5f5;
	}

	.language-option.active {
		color: #ff3e00;
		font-weight: 600;
	}

	.language-option:focus {
		outline: 2px solid #ff3e00;
		outline-offset: 2px;
	}

	.language-divider {
		color: #ddd;
		user-select: none;
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
		line-height: 1.6;
		white-space: pre-line;
		text-align: left;
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
		margin-bottom: 24rem;
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

	.currency-keyboard-hint {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.hint-icon {
		font-size: 1.2rem;
	}

	/* Keyboard key styles are now injected via {@html} in translations */
	:global(.keyboard-hint kbd),
	:global(.currency-keyboard-hint kbd) {
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
