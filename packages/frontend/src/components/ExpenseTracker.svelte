<script lang="ts">
	import type { Expense } from '../types/expense'
	import ExpenseForm from './ExpenseForm.svelte'
	import ExpenseList from './ExpenseList.svelte'
	import KeyboardHint from './KeyboardHint.svelte'
	import { settings } from '../stores/settings.svelte'
	import { t } from 'svelte-i18n'

	let expenses = $state<Expense[]>([])
	let nextId = $state(1)
	let showHint = $state(false)

	let sessionCurrencies = $derived(getSessionCurrencies(expenses))

	function getSessionCurrencies(expenseList: Expense[]): string[] {
		const uniqueCurrencies = new Set(expenseList.map(e => e.currency))
		return Array.from(uniqueCurrencies)
	}

	function addExpense(name: string, amount: number, currency: string, payer?: string) {
		expenses = [...expenses, { id: nextId++, name, amount, currency, payer }]
	}

	function removeExpense(id: number) {
		expenses = expenses.filter(e => e.id !== id)
	}

	function handleMouseSubmit() {
		// Only show hint if it hasn't been dismissed before
		if (!settings.hasSeenHint('expenseForm')) {
			showHint = true
		}
	}

	function handleDismissHint() {
		showHint = false
		settings.dismissHint('expenseForm')
	}
</script>

<div class="expense-tracker">
	<h2>{$t('expenseTracker.title')}</h2>
	<KeyboardHint visible={showHint} onDismiss={handleDismissHint} />
	<ExpenseForm onAdd={addExpense} onMouseSubmit={handleMouseSubmit} {sessionCurrencies} />
	<ExpenseList {expenses} onRemove={removeExpense} />
</div>

<style>
	.expense-tracker {
		margin: 2em 0;
		padding: 1.5em;
		border-radius: 8px;
		background: var(--color-surface-1);
	}
</style>
