<script lang="ts">
	export let onAdd: (name: string, amount: number) => void
	export let onMouseSubmit: (() => void) | undefined = undefined

	let expenseName = ''
	let expenseAmount = ''
	let nameInput: HTMLInputElement
	let isMouseClick = false

	function handleSubmit() {
		if (!expenseName.trim() || !expenseAmount) return

		const amount = parseFloat(expenseAmount)
		if (isNaN(amount) || amount <= 0) return

		onAdd(expenseName.trim(), amount)

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
</script>

<div class="form-container">
	<h3>Add Expense</h3>
	<form on:submit|preventDefault={handleSubmit}>
		<input
			type="text"
			placeholder="Expense name"
			bind:value={expenseName}
			bind:this={nameInput}
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
		<button type="submit" on:click={handleButtonClick}>Add</button>
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
</style>
