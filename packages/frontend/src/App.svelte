<script lang="ts">
	import { onMount } from 'svelte'
	import { config } from './config'

	interface Expense {
		id: number
		name: string
		amount: number
	}

	let healthStatus = 'loading'
	let databaseStatus = 'loading'
	let apiUrl = ''

	let expenses: Expense[] = []
	let expenseName = ''
	let expenseAmount = ''
	let nextId = 1

	function addExpense() {
		if (!expenseName.trim() || !expenseAmount) return

		const amount = parseFloat(expenseAmount)
		if (isNaN(amount) || amount <= 0) return

		expenses = [...expenses, { id: nextId++, name: expenseName.trim(), amount }]
		expenseName = ''
		expenseAmount = ''
	}

	function removeExpense(id: number) {
		expenses = expenses.filter(e => e.id !== id)
	}

	function getTotalAmount(): number {
		return expenses.reduce((sum, expense) => sum + expense.amount, 0)
	}

	async function checkHealth() {
		try {
			const response = await fetch('/api/health')
			const data = await response.json()
			healthStatus = data.status === 'ok' ? 'ok' : 'error'
			databaseStatus = data.database === 'ok' ? 'ok' : 'error'
		} catch (error) {
			healthStatus = 'error'
			databaseStatus = 'error'
			console.error('Health check failed:', error)
		}
	}

	onMount(() => {
		apiUrl = config.apiUrl
		checkHealth()
	})
</script>

<main>
	<h1>Trip Settle</h1>
	<p>Expense settlement made easy</p>

	<div class="status">
		<h3>System Status</h3>
		<p class="api-url">{apiUrl}</p>

		<div class="status-row">
			<span class="label">Backend:</span>
			<div class="health {healthStatus}">
				{#if healthStatus === 'loading'}
					<span>⏳ Checking...</span>
				{:else if healthStatus === 'ok'}
					<span>✅ Healthy</span>
				{:else}
					<span>❌ Error</span>
				{/if}
			</div>
		</div>

		<div class="status-row">
			<span class="label">Database:</span>
			<div class="health {databaseStatus}">
				{#if databaseStatus === 'loading'}
					<span>⏳ Checking...</span>
				{:else if databaseStatus === 'ok'}
					<span>✅ Connected</span>
				{:else}
					<span>❌ Disconnected</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="expenses-section">
		<h3>Add Expense</h3>
		<form on:submit|preventDefault={addExpense}>
			<input
				type="text"
				placeholder="Expense name"
				bind:value={expenseName}
				required
			/>
			<input
				type="number"
				placeholder="Amount"
				bind:value={expenseAmount}
				step="0.01"
				min="0.01"
				required
			/>
			<button type="submit">Add</button>
		</form>

		<h3>Expenses</h3>
		{#if expenses.length === 0}
			<p class="empty-state">No expenses yet</p>
		{:else}
			<ul class="expense-list">
				{#each expenses as expense (expense.id)}
					<li class="expense-item">
						<span class="expense-name">{expense.name}</span>
						<span class="expense-amount">${expense.amount.toFixed(2)}</span>
						<button class="remove-btn" on:click={() => removeExpense(expense.id)}>×</button>
					</li>
				{/each}
			</ul>
			<div class="total">
				<span class="total-label">Total:</span>
				<span class="total-amount">${getTotalAmount().toFixed(2)}</span>
			</div>
		{/if}
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 600px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		margin-bottom: 0.2em;
	}

	h3 {
		margin: 1em 0 0.5em;
		color: #333;
	}

	.status {
		margin: 2em 0;
		padding: 1.5em;
		border-radius: 8px;
		background: #f5f5f5;
	}

	.api-url {
		font-family: monospace;
		font-size: 0.9em;
		color: #666;
		margin: 0.5em 0 1em;
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: 1em;
		margin-bottom: 0.75em;
	}

	.status-row:last-child {
		margin-bottom: 0;
	}

	.status-row .label {
		font-weight: 600;
		min-width: 80px;
		color: #333;
	}

	.health {
		padding: 0.5em 1em;
		border-radius: 6px;
		font-weight: bold;
		flex: 1;
	}

	.health.loading {
		background: #fff3cd;
		color: #856404;
	}

	.health.ok {
		background: #d4edda;
		color: #155724;
	}

	.health.error {
		background: #f8d7da;
		color: #721c24;
	}

	.expenses-section {
		margin: 2em 0;
		padding: 1.5em;
		border-radius: 8px;
		background: #f9f9f9;
	}

	form {
		display: flex;
		gap: 0.5em;
		margin-bottom: 2em;
	}

	input {
		padding: 0.6em;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1em;
	}

	input[type='text'] {
		flex: 2;
	}

	input[type='number'] {
		flex: 1;
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
	}

	button:hover {
		background: #e63900;
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
	}

	.remove-btn {
		padding: 0.2em 0.5em;
		background: #f44336;
		font-size: 1.2em;
		line-height: 1;
		margin: 0;
	}

	.remove-btn:hover {
		background: #d32f2f;
	}

	.total {
		display: flex;
		justify-content: space-between;
		padding: 1em;
		background: white;
		border-radius: 4px;
		border: 2px solid #ff3e00;
		font-size: 1.2em;
		font-weight: 700;
	}

	.total-amount {
		color: #ff3e00;
	}

	@media (min-width: 640px) {
		main {
			max-width: 700px;
		}
	}
</style>
