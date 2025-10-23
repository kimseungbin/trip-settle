<script lang="ts">
	import type { Expense } from '../types/expense'
	import { settings } from '../stores/settings.svelte'

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
</script>

<div class="list-container">
	<h3>Expenses</h3>
	{#if expenses.length === 0}
		<p class="empty-state">No expenses yet</p>
	{:else}
		<ul class="expense-list">
			{#each expenses as expense (expense.id)}
				<li class="expense-item">
					<span class="expense-name">{expense.name}</span>
					<span class="expense-amount">
						{expense.amount.toFixed(2)}
						{#if showCurrencyBadges}
							<span class="currency-code">{expense.currency}</span>
						{/if}
					</span>
					<button class="remove-btn" onclick={() => onRemove(expense.id)}>×</button>
				</li>
			{/each}
		</ul>
		<div class="total">
			<span class="total-label">Total:</span>
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
		color: #333;
	}

	.empty-state {
		color: #999;
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
		background: white;
		border-radius: 4px;
		border: 1px solid #e0e0e0;
	}

	.expense-name {
		flex: 1;
		text-align: left;
		font-weight: 500;
	}

	.expense-amount {
		font-weight: 600;
		color: #ff3e00;
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	.currency-code {
		font-size: 0.75em;
		font-weight: 700;
		color: #666;
		background: #f5f5f5;
		padding: 0.2em 0.4em;
		border-radius: 3px;
	}

	.remove-btn {
		padding: 0.2em 0.5em;
		background: #f44336;
		font-size: 1.2em;
		line-height: 1;
		margin: 0;
		cursor: pointer;
		color: white;
		border: none;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.remove-btn:hover {
		background: #d32f2f;
	}

	.total {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1em;
		background: white;
		border-radius: 4px;
		border: 2px solid #ff3e00;
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
		color: #ff3e00;
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	.total-currency {
		font-size: 0.75em;
		font-weight: 700;
		color: #666;
		background: #fff5f3;
		padding: 0.3em 0.5em;
		border-radius: 3px;
	}

	.total-currency-text {
		font-size: 0.85em;
		font-weight: 600;
		color: #666;
		margin-left: 0.3em;
	}
</style>
