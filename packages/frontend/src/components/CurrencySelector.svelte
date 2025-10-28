<script lang="ts">
	import type { Currency } from '../types/currency'
	import { DEFAULT_CURRENCY, getCurrencyByCode, searchCurrencies, getCurrencyDisplayName } from '../data/currencies'
	import { locale, t } from 'svelte-i18n'
	import { focusElementImmediate } from '../lib/focus'

	let {
		value = $bindable(DEFAULT_CURRENCY),
		sessionCurrencies = [],
		onselect,
		autofocus = false,
		initialOpen = false,
	}: {
		value?: string
		sessionCurrencies?: string[]
		onselect?: (event: CustomEvent<{ currency: string }>) => void
		autofocus?: boolean
		initialOpen?: boolean
	} = $props()

	let isOpen = $state(initialOpen)
	let searchQuery = $state('')
	let selectedIndex = $state(0)
	let inputElement = $state<HTMLInputElement | undefined>(undefined)
	let buttonElement = $state<HTMLButtonElement | undefined>(undefined)

	// Auto-focus appropriate element when component mounts
	$effect(() => {
		if (autofocus) {
			if (initialOpen && inputElement) {
				// If starting open, focus the search input
				focusElementImmediate(inputElement, 100)
			} else if (buttonElement) {
				// If starting closed, focus the button
				focusElementImmediate(buttonElement, 100)
			}
		}
	})

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
			focusElementImmediate(inputElement, 0)
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
		<span class="keyboard-icon">{$t('currencySelector.icon')}</span>
		{selectedCurrency?.code || DEFAULT_CURRENCY}
		<span class="arrow" class:open={isOpen}>▼</span>
	</button>

	{#if isOpen}
		<div class="dropdown">
			<input
				type="text"
				class="search-input"
				placeholder={searchQuery ? $t('currencySelector.searching') : $t('currencySelector.placeholder')}
				bind:value={searchQuery}
				bind:this={inputElement}
				oninput={handleInput}
				onkeydown={handleKeydown}
				onblur={handleBlur}
			/>

			{#if !searchQuery}
				<div class="section-header">{$t('currencySelector.recommended')}</div>
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
						<span class="currency-name">{getCurrencyDisplayName(currency, $locale || 'en')}</span>
						{#if currency.code === value}
							<span class="check">{$t('currencySelector.checkMark')}</span>
						{/if}
					</li>
				{:else}
					<li class="no-results">{$t('currencySelector.noResults')}</li>
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
		border: 1px solid var(--color-border);
		border-radius: 4px;
		background: var(--color-surface);
		color: var(--color-text);
		font-size: 1em;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
		min-width: 85px;
	}

	.currency-button:hover {
		border-color: var(--color-primary);
		background: var(--color-primary-light);
	}

	.currency-button:focus {
		outline: none;
		border-color: var(--color-primary);
		background: var(--color-primary-light);
		box-shadow:
			0 0 0 3px var(--color-primary-alpha-20),
			var(--shadow-md);
		animation: buttonFocusPulse 2s ease-in-out infinite;
	}

	@keyframes buttonFocusPulse {
		0%,
		100% {
			box-shadow:
				0 0 0 3px var(--color-primary-alpha-20),
				var(--shadow-md);
		}
		50% {
			box-shadow:
				0 0 0 5px var(--color-primary-alpha-30),
				var(--shadow-lg);
		}
	}

	.keyboard-icon {
		font-size: 0.9em;
		opacity: 0.7;
	}

	.arrow {
		font-size: 0.7em;
		transition: transform var(--transition-fast);
		color: var(--color-text-secondary);
	}

	.arrow.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--color-surface);
		border: 2px solid var(--color-primary);
		border-radius: 6px;
		box-shadow: var(--shadow-lg);
		z-index: 100;
		min-width: 280px;
		max-height: 320px;
		display: flex;
		flex-direction: column;
	}

	/* Mobile responsive - remove min-width on small screens */
	@media (max-width: 640px) {
		.dropdown {
			min-width: auto;
		}
	}

	.search-input {
		width: 100%;
		padding: 0.75em;
		border: none;
		border-bottom: 1px solid var(--color-border-light);
		background: var(--color-surface);
		color: var(--color-text);
		font-size: 0.9em;
		outline: none;
		box-sizing: border-box; /* Include padding in width calculation */
	}

	.search-input::placeholder {
		color: var(--color-text-tertiary);
		font-style: italic;
	}

	.section-header {
		padding: 0.5em 0.75em;
		background: var(--color-primary-light);
		font-size: 0.75em;
		font-weight: 700;
		color: var(--color-primary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--color-border-light);
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
		transition: background var(--transition-fast);
	}

	.currency-item:hover,
	.currency-item.selected {
		background: var(--color-surface-1);
	}

	.currency-item.active {
		background: var(--color-primary-light);
	}

	.currency-code {
		font-weight: 700;
		font-size: 0.9em;
		color: var(--color-text);
		min-width: 40px;
	}

	.currency-name {
		flex: 1;
		font-size: 0.85em;
		color: var(--color-text-secondary);
	}

	.check {
		color: var(--color-primary);
		font-size: 0.8em;
	}

	.no-results {
		padding: 1em;
		text-align: center;
		color: var(--color-text-tertiary);
		font-style: italic;
	}
</style>
