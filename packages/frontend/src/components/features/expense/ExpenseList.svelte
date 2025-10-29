<script lang="ts">
	import type { Expense } from '../../../types/expense'
	import { settings } from '../../../stores/settings.svelte'
	import { t } from 'svelte-i18n'

	let {
		expenses,
		onRemove,
	}: {
		expenses: Expense[]
		onRemove: (id: number) => void
	} = $props()

	function getTotalsByCurrency(expenseList: Expense[]): Map<string, number> {
		const totals = new Map<string, number>()
		expenseList.forEach(expense => {
			const current = totals.get(expense.currency) || 0
			totals.set(expense.currency, current + expense.amount)
		})
		return totals
	}

	let totalsByCurrency = $derived(getTotalsByCurrency(expenses))

	// In single-currency mode, don't show currency badges since all amounts are the same currency
	const showCurrencyBadges = $derived(settings.currencyMode === 'multi')
	// In single-payer mode, don't show payer info since all expenses are from the same payer
	const showPayerInfo = $derived(settings.paymentMode === 'multi')
</script>

<div class="list-container">
	<h3>{$t('expenseList.title')}</h3>
	{#if expenses.length === 0}
		<p class="empty-state">{$t('expenseList.empty')}</p>
	{:else}
		<ul class="expense-list">
			{#each expenses as expense (expense.id)}
				<li class="expense-item">
					<div class="expense-info">
						<span class="expense-name">{expense.name}</span>
						{#if showPayerInfo && expense.payer}
							<span class="expense-payer">by {expense.payer}</span>
						{/if}
					</div>
					<span class="expense-amount">
						{expense.amount.toFixed(2)}
						{#if showCurrencyBadges}
							<span class="currency-code">{expense.currency}</span>
						{/if}
					</span>
					<button class="remove-btn" onclick={() => onRemove(expense.id)}
						>{$t('expenseList.removeButton')}</button
					>
				</li>
			{/each}
		</ul>
		<div class="total">
			<span class="total-label">{$t('expenseList.total')}</span>
			<div class="total-amounts">
				{#each Array.from(totalsByCurrency.entries()) as [currency, amount]}
					<span class="total-amount">
						{amount.toFixed(2)}
						{#if showCurrencyBadges}
							<span class="total-currency">{currency}</span>
						{:else}
							<span class="total-currency-text">{currency}</span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.list-container {
		margin-top: 1em;
	}

	h3 {
		margin: 0 0 0.5em;
		color: var(--color-text);
	}

	.empty-state {
		color: var(--color-text-tertiary);
		font-style: italic;
		margin: 1em 0;
	}

	.expense-list {
		list-style: none;
		padding: 0;
		margin: 0 0 1em;
	}

	.expense-item {
		display: flex;
		align-items: center;
		gap: 1em;
		padding: 0.75em;
		margin-bottom: 0.5em;
		background: var(--color-surface);
		border-radius: 4px;
		border: 1px solid var(--color-border);
	}

	.expense-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25em;
		text-align: left;
	}

	.expense-name {
		font-weight: 500;
	}

	.expense-payer {
		font-size: 0.85em;
		color: var(--color-text-secondary);
		font-style: italic;
	}

	.expense-amount {
		font-weight: 600;
		color: var(--color-primary);
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	.currency-code {
		font-size: 0.75em;
		font-weight: 700;
		color: var(--color-text-secondary);
		background: var(--color-surface-1);
		padding: 0.2em 0.4em;
		border-radius: 3px;
	}

	.remove-btn {
		padding: 0.2em 0.5em;
		background: var(--color-error);
		font-size: 1.2em;
		line-height: 1;
		margin: 0;
		cursor: pointer;
		color: var(--color-surface);
		border: none;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.remove-btn:hover {
		background: var(--color-error);
		filter: brightness(0.9);
	}

	.total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1em;
		background: var(--color-surface);
		border-radius: 4px;
		border: 2px solid var(--color-primary);
		font-size: 1.2em;
		font-weight: 700;
	}

	.total-amounts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75em;
		align-items: center;
	}

	.total-amount {
		color: var(--color-primary);
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	.total-currency {
		font-size: 0.75em;
		font-weight: 700;
		color: var(--color-text-secondary);
		background: var(--color-primary-light);
		padding: 0.3em 0.5em;
		border-radius: 3px;
	}

	.total-currency-text {
		font-size: 0.85em;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-left: 0.3em;
	}
</style>
