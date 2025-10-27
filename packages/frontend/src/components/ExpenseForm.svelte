<script lang="ts">
	import CurrencySelector from './CurrencySelector.svelte'
	import PayerSelector from './PayerSelector.svelte'
	import { DEFAULT_CURRENCY } from '../data/currencies'
	import { settings } from '../stores/settings.svelte'
	import { loadLastPayer, saveLastPayer } from '../lib/lastPayer'
	import { onMount } from 'svelte'
	import { t } from 'svelte-i18n'

	let {
		onAdd,
		onMouseSubmit = undefined,
		sessionCurrencies = [],
	}: {
		onAdd: (name: string, amount: number, currency: string, payer?: string) => void
		onMouseSubmit?: (() => void) | undefined
		sessionCurrencies?: string[]
	} = $props()

	// In single-currency mode, use the default currency from settings
	// In multi-currency mode, allow user to select currency per expense
	let expenseName = $state('')
	let expenseAmount = $state('')
	let selectedCurrency = $state(settings.currencyMode === 'single' ? settings.defaultCurrency : DEFAULT_CURRENCY)
	let selectedPayer = $state('')
	let payerSelect = $state<HTMLSelectElement | undefined>(undefined)
	let nameInput = $state<HTMLInputElement | undefined>(undefined)
	let submitButton = $state<HTMLButtonElement | undefined>(undefined)
	let isMouseClick = $state(false)

	// Derived state: show currency selector only in multi-currency mode
	const showCurrencySelector = $derived(settings.currencyMode === 'multi')
	// Derived state: show payer selector only in multi-payer mode
	const showPayerSelector = $derived(settings.paymentMode === 'multi')

	function handleSubmit() {
		// Always read fresh from settings to avoid stale derived values
		const needsPayer = settings.paymentMode === 'multi'

		if (!expenseName.trim() || !expenseAmount) return
		if (needsPayer && !selectedPayer) return

		const amount = parseFloat(expenseAmount)
		if (isNaN(amount) || amount <= 0) return

		onAdd(expenseName.trim(), amount, selectedCurrency, needsPayer ? selectedPayer : undefined)

		// Save the last selected payer to local storage for next time
		if (needsPayer && selectedPayer) {
			saveLastPayer(selectedPayer)
		}

		// Trigger mouse submit callback if this was a mouse click
		if (isMouseClick && onMouseSubmit) {
			onMouseSubmit()
		}

		expenseName = ''
		expenseAmount = ''
		// Keep the payer selection for the next expense (don't reset it)
		// Defer focus to next frame to avoid webkit timing issues
		requestAnimationFrame(() => {
			nameInput?.focus()
		})
		isMouseClick = false
	}

	function handleButtonClick() {
		isMouseClick = true
	}

	function handleCurrencySelect() {
		// Auto-focus submit button after currency selection
		setTimeout(() => submitButton?.focus(), 0)
	}

	function handleKeydown(event: KeyboardEvent) {
		// Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux) submits from anywhere
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault()
			handleSubmit()
		}
	}

	/**
	 * Focus the appropriate input on mount for keyboard accessibility
	 * Load the last selected payer from local storage
	 */
	onMount(() => {
		// Load last selected payer if in multi-payer mode
		if (showPayerSelector) {
			const lastPayer = loadLastPayer()
			// Only set if the payer still exists in the current payer list
			if (lastPayer && settings.payers.includes(lastPayer)) {
				selectedPayer = lastPayer
			}

			// Defer focus to next frame to ensure DOM is fully rendered (fixes webkit timing issues)
			requestAnimationFrame(() => {
				// Focus payer selector if no payer is selected, otherwise focus name input
				if (!selectedPayer) {
					payerSelect?.focus()
				} else {
					nameInput?.focus()
				}
			})
		} else {
			// Defer focus to next frame to ensure DOM is fully rendered (fixes webkit timing issues)
			requestAnimationFrame(() => {
				// In single-payer mode, focus name input directly
				nameInput?.focus()
			})
		}
	})
</script>

<div class="form-container">
	<h3>{$t('expenseForm.title')}</h3>
	<form
		onsubmit={e => {
			e.preventDefault()
			handleSubmit()
		}}
		onkeydown={handleKeydown}
	>
		{#if showPayerSelector}
			<PayerSelector bind:value={selectedPayer} bind:selectRef={payerSelect} payers={settings.payers} />
		{/if}
		<input
			type="text"
			autocomplete="off"
			placeholder={$t('expenseForm.namePlaceholder')}
			bind:value={expenseName}
			bind:this={nameInput}
			required
		/>
		<input
			type="number"
			inputmode="decimal"
			placeholder={$t('expenseForm.amountPlaceholder')}
			bind:value={expenseAmount}
			required
		/>
		{#if showCurrencySelector}
			<CurrencySelector bind:value={selectedCurrency} {sessionCurrencies} onselect={handleCurrencySelect} />
		{/if}
		<button type="submit" bind:this={submitButton} onclick={handleButtonClick} tabindex="0"
			>{$t('expenseForm.addButton')}</button
		>
	</form>
</div>

<style>
	.form-container {
		margin-bottom: 2em;
	}

	h3 {
		margin: 0 0 0.5em;
		color: var(--color-text);
	}

	form {
		display: flex;
		gap: 0.5em;
		flex-wrap: wrap;
	}

	input {
		padding: 0.6em;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 1em;
		min-width: 0; /* Allow inputs to shrink below content size */
	}

	input[type='text'] {
		flex: 2 1 150px; /* grow, shrink, min-width */
	}

	input[type='number'] {
		flex: 1 1 80px; /* grow, shrink, min-width */
	}

	button {
		padding: 0.6em 1.2em;
		font-size: 1em;
		cursor: pointer;
		background: var(--color-primary);
		color: var(--color-surface);
		border: none;
		border-radius: 4px;
		transition: background 0.2s;
		flex-shrink: 0; /* Prevent button from shrinking */
		white-space: nowrap; /* Keep text on one line */
	}

	button:hover {
		background: var(--color-primary-hover);
	}

	/* Mobile responsive layout */
	@media (max-width: 640px) {
		form {
			flex-direction: column;
		}

		input[type='text'],
		input[type='number'] {
			width: 100%;
			flex: none;
			box-sizing: border-box; /* Include padding in width calculation */
		}

		button {
			width: 100%;
			box-sizing: border-box; /* Include padding in width calculation */
		}
	}
</style>
