<script lang="ts">
	import SystemStatus from './components/SystemStatus.svelte'
	import ExpenseTracker from './components/ExpenseTracker.svelte'
</script>

<main>
	<h1>Trip Settle</h1>
	<p>Expense settlement made easy</p>

	<ExpenseTracker />
	<SystemStatus />
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

	@media (min-width: 640px) {
		main {
			max-width: 700px;
		}
	}
</style>
