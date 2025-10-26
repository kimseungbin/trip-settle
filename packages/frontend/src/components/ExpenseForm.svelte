<script lang="ts">
	import CurrencySelector from './CurrencySelector.svelte'
	import { DEFAULT_CURRENCY, getCurrencyByCode } from '../data/currencies'
	import { settings } from '../stores/settings.svelte'
	import { onMount } from 'svelte'
	import { t } from 'svelte-i18n'

	let {
		onAdd,
		onMouseSubmit = undefined,
		sessionCurrencies = [],
	}: {
		onAdd: (name: string, amount: number, currency: string) => void
		onMouseSubmit?: (() => void) | undefined
		sessionCurrencies?: string[]
	} = $props()

	// In single-currency mode, use the default currency from settings
	// In multi-currency mode, allow user to select currency per expense
	let expenseName = $state('')
	let expenseAmount = $state('')
	let selectedCurrency = $state(settings.currencyMode === 'single' ? settings.defaultCurrency : DEFAULT_CURRENCY)
	let nameInput = $state<HTMLInputElement | undefined>(undefined)
	let submitButton = $state<HTMLButtonElement | undefined>(undefined)
	let isMouseClick = $state(false)

	// Derived state: show currency selector only in multi-currency mode
	const showCurrencySelector = $derived(settings.currencyMode === 'multi')

	// Derived state: get input step and min based on selected currency's decimal places
	const currency = $derived(getCurrencyByCode(selectedCurrency))
	const inputStep = $derived(
		currency ? (currency.decimalPlaces === 0 ? '1' : `0.${'0'.repeat(currency.decimalPlaces - 1)}1`) : '0.01'
	)
	const inputMin = $derived(
		currency ? (currency.decimalPlaces === 0 ? '1' : `0.${'0'.repeat(currency.decimalPlaces - 1)}1`) : '0.01'
	)
	const inputMode = $derived(currency?.decimalPlaces === 0 ? 'numeric' : 'decimal')

	function handleSubmit() {
		if (!expenseName.trim() || !expenseAmount) return

		const amount = parseFloat(expenseAmount)
		if (isNaN(amount) || amount <= 0) return

		onAdd(expenseName.trim(), amount, selectedCurrency)

		// Trigger mouse submit callback if this was a mouse click
		if (isMouseClick && onMouseSubmit) {
			onMouseSubmit()
		}

		expenseName = ''
		expenseAmount = ''
		nameInput?.focus()
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
	 * Focus the name input on mount for keyboard accessibility
	 */
	onMount(() => {
		nameInput?.focus()
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
		<input
			type="text"
			placeholder={$t('expenseForm.namePlaceholder')}
			bind:value={expenseName}
			bind:this={nameInput}
			required
		/>
		<input
			type="number"
			inputmode={inputMode}
			placeholder={$t('expenseForm.amountPlaceholder')}
			bind:value={expenseAmount}
			step={inputStep}
			min={inputMin}
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
		color: #333;
	}

	form {
		display: flex;
		gap: 0.5em;
		flex-wrap: wrap;
	}

	input {
		padding: 0.6em;
		border: 1px solid #ddd;
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
		background: #ff3e00;
		color: white;
		border: none;
		border-radius: 4px;
		transition: background 0.2s;
		flex-shrink: 0; /* Prevent button from shrinking */
		white-space: nowrap; /* Keep text on one line */
	}

	button:hover {
		background: #e63900;
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
		}

		button {
			width: 100%;
		}
	}
</style>
