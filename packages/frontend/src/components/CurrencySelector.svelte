<script lang="ts">
	import type { Currency } from '../types/expense'
	import { DEFAULT_CURRENCY, getCurrencyByCode, searchCurrencies } from '../data/currencies'

	let {
		value = $bindable(DEFAULT_CURRENCY),
		sessionCurrencies = [],
		onselect,
	}: {
		value?: string
		sessionCurrencies?: string[]
		onselect?: (event: CustomEvent<{ currency: string }>) => void
	} = $props()

	let isOpen = $state(false)
	let searchQuery = $state('')
	let selectedIndex = $state(0)
	let inputElement = $state<HTMLInputElement | undefined>(undefined)
	let buttonElement = $state<HTMLButtonElement | undefined>(undefined)

	let recommendedCurrencies = $derived(getRecommendedCurrencies(sessionCurrencies))
	let displayedCurrencies = $derived(searchQuery ? searchCurrencies(searchQuery) : recommendedCurrencies)
	let selectedCurrency = $derived(getCurrencyByCode(value))

	function getRecommendedCurrencies(session: string[]): Currency[] {
		const recommended = new Set<string>()

		// 1. Default currency (KRW)
		recommended.add(DEFAULT_CURRENCY)

		// 2. USD
		recommended.add('USD')

		// 3. TODO: Geolocation currency

		// 4. Session currencies
		session.forEach(code => recommended.add(code))

		return Array.from(recommended)
			.map(code => getCurrencyByCode(code))
			.filter((c): c is Currency => c !== undefined)
	}

	function toggleDropdown() {
		isOpen = !isOpen
		if (isOpen) {
			searchQuery = ''
			selectedIndex = 0
			setTimeout(() => inputElement?.focus(), 0)
		}
	}

	function selectCurrency(currency: Currency) {
		value = currency.code
		isOpen = false
		searchQuery = ''
		// Notify parent that selection is complete
		if (onselect) {
			onselect(new CustomEvent('select', { detail: { currency: currency.code } }))
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!isOpen) {
			if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
				event.preventDefault()
				toggleDropdown()
			}
			return
		}

		switch (event.key) {
			case 'Escape':
				event.preventDefault()
				isOpen = false
				searchQuery = ''
				break
			case 'ArrowDown':
				event.preventDefault()
				selectedIndex = Math.min(selectedIndex + 1, displayedCurrencies.length - 1)
				break
			case 'ArrowUp':
				event.preventDefault()
				selectedIndex = Math.max(selectedIndex - 1, 0)
				break
			case 'Enter':
				event.preventDefault()
				if (displayedCurrencies[selectedIndex]) {
					selectCurrency(displayedCurrencies[selectedIndex])
				}
				break
		}
	}

	function handleInput() {
		selectedIndex = 0
	}

	function handleBlur(event: FocusEvent) {
		// Close dropdown when clicking outside
		const relatedTarget = event.relatedTarget as HTMLElement
		if (!relatedTarget || !relatedTarget.closest('.currency-selector')) {
			setTimeout(() => {
				isOpen = false
				searchQuery = ''
			}, 150)
		}
	}
</script>

<div class="currency-selector">
	<button
		type="button"
		class="currency-button"
		tabindex="0"
		bind:this={buttonElement}
		onclick={toggleDropdown}
		onkeydown={handleKeydown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		{selectedCurrency?.code || DEFAULT_CURRENCY}
		<span class="arrow" class:open={isOpen}>▼</span>
	</button>

	{#if isOpen}
		<div class="dropdown">
			<input
				type="text"
				class="search-input"
				placeholder={searchQuery ? 'Searching...' : 'Type to search all currencies'}
				bind:value={searchQuery}
				bind:this={inputElement}
				oninput={handleInput}
				onkeydown={handleKeydown}
				onblur={handleBlur}
			/>

			{#if !searchQuery}
				<div class="section-header">Recommended</div>
			{/if}

			<ul class="currency-list" role="listbox">
				{#each displayedCurrencies as currency, index}
					<li
						class="currency-item"
						class:selected={index === selectedIndex}
						class:active={currency.code === value}
						role="option"
						aria-selected={currency.code === value}
						onmouseenter={() => (selectedIndex = index)}
						onclick={() => selectCurrency(currency)}
						onkeydown={e => e.key === 'Enter' && selectCurrency(currency)}
						tabindex="0"
					>
						<span class="currency-code">{currency.code}</span>
						<span class="currency-name">{currency.name}</span>
						{#if currency.code === value}
							<span class="check">●</span>
						{/if}
					</li>
				{:else}
					<li class="no-results">No currencies found</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.currency-selector {
		position: relative;
	}

	.currency-button {
		display: flex;
		align-items: center;
		gap: 0.25em;
		padding: 0.6em 0.8em;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: white;
		font-size: 1em;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		min-width: 85px;
	}

	.currency-button:hover {
		border-color: #ff3e00;
		background: #fff5f3;
	}

	.currency-button:focus {
		outline: 2px solid #ff3e00;
		outline-offset: 2px;
	}

	.arrow {
		font-size: 0.7em;
		transition: transform 0.2s;
		color: #666;
	}

	.arrow.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: white;
		border: 2px solid #ff3e00;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 100;
		min-width: 280px;
		max-height: 320px;
		display: flex;
		flex-direction: column;
	}

	.search-input {
		width: 100%;
		padding: 0.75em;
		border: none;
		border-bottom: 1px solid #e0e0e0;
		font-size: 0.9em;
		outline: none;
	}

	.search-input::placeholder {
		color: #999;
		font-style: italic;
	}

	.section-header {
		padding: 0.5em 0.75em;
		background: #fff5f3;
		font-size: 0.75em;
		font-weight: 700;
		color: #ff3e00;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid #ffe0d9;
	}

	.currency-list {
		list-style: none;
		padding: 0;
		margin: 0;
		overflow-y: auto;
		max-height: 240px;
	}

	.currency-item {
		display: flex;
		align-items: center;
		gap: 0.75em;
		padding: 0.6em 0.75em;
		cursor: pointer;
		transition: background 0.15s;
	}

	.currency-item:hover,
	.currency-item.selected {
		background: #f5f5f5;
	}

	.currency-item.active {
		background: #fff5f3;
	}

	.currency-code {
		font-weight: 700;
		font-size: 0.9em;
		color: #333;
		min-width: 40px;
	}

	.currency-name {
		flex: 1;
		font-size: 0.85em;
		color: #666;
	}

	.check {
		color: #ff3e00;
		font-size: 0.8em;
	}

	.no-results {
		padding: 1em;
		text-align: center;
		color: #999;
		font-style: italic;
	}
</style>
