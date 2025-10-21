<script lang="ts">
	let count = 0

	function increment() {
		count += 1
	}
</script>

<main>
	<h1>Trip Settle</h1>
	<p>Expense settlement made easy</p>
	<button on:click={increment}>
		Count: {count}
	</button>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
