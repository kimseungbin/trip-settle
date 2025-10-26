<script lang="ts">
	let {
		value = $bindable(''),
		payers,
		selectRef = $bindable(undefined),
	}: { value: string; payers: string[]; selectRef?: HTMLSelectElement } = $props()
</script>

<select bind:value bind:this={selectRef}>
	<option value="" disabled>Select payer</option>
	{#each payers as payer}
		<option value={payer}>{payer}</option>
	{/each}
</select>

<style>
	select {
		padding: 0.6em;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1em;
		min-width: 0;
		flex: 1 1 100px;
		background: white;
		cursor: pointer;
	}

	select:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	@media (max-width: 640px) {
		select {
			width: 100%;
			flex: none;
			box-sizing: border-box;
		}
	}
</style>
