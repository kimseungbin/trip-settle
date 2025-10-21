<script lang="ts">
	import type { Expense } from '../types/expense'
	import ExpenseForm from './ExpenseForm.svelte'
	import ExpenseList from './ExpenseList.svelte'

	let expenses: Expense[] = []
	let nextId = 1

	function addExpense(name: string, amount: number) {
		expenses = [...expenses, { id: nextId++, name, amount }]
	}

	function removeExpense(id: number) {
		expenses = expenses.filter(e => e.id !== id)
	}
</script>

<div class="expense-tracker">
	<ExpenseForm onAdd={addExpense} />
	<ExpenseList {expenses} onRemove={removeExpense} />
</div>

<style>
	.expense-tracker {
		margin: 2em 0;
		padding: 1.5em;
		border-radius: 8px;
		background: #f9f9f9;
	}
</style>
