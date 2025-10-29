<script lang="ts">
	import { onMount } from 'svelte'
	import { focusElement } from '../lib/focus'
	import { ANIMATION_DURATION } from '../constants/timing'

	let {
		payers = $bindable<string[]>([]),
		onComplete,
		onBack,
		autofocus = false,
	}: {
		payers?: string[]
		onComplete: () => void
		onBack: () => void
		autofocus?: boolean
	} = $props()

	let payerInput = $state<HTMLInputElement | undefined>(undefined)
	let payerListContainer = $state<HTMLDivElement | undefined>(undefined)
	let lastAddedPayer = $state<string | null>(null)

	/**
	 * Focus the payer input when component mounts (only if autofocus is enabled)
	 */
	onMount(() => {
		if (autofocus) {
			focusElement(payerInput)
		}
	})

	/**
	 * Add a new payer to the list
	 */
	function addPayer(name: string) {
		if (name && !payers.includes(name)) {
			payers = [name, ...payers]
			lastAddedPayer = name
			// Scroll to top to show the newly added item
			setTimeout(() => {
				if (payerListContainer) {
					payerListContainer.scrollTop = 0
				}
			}, 0)
			// Clear the animation marker after animation completes
			setTimeout(() => {
				lastAddedPayer = null
			}, ANIMATION_DURATION.FAST)
		}
	}

	/**
	 * Remove a payer from the list
	 */
	function removePayer(index: number) {
		payers = payers.filter((_, i) => i !== index)
	}

	/**
	 * Handle keydown on payer input (Enter to add)
	 */
	function handlePayerInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault()
			const input = e.currentTarget as HTMLInputElement
			const name = input.value.trim()
			addPayer(name)
			input.value = ''
			focusElement(input)
		}
	}

	/**
	 * Handle add payer button click
	 */
	function handleAddPayerClick() {
		if (payerInput) {
			const name = payerInput.value.trim()
			addPayer(name)
			payerInput.value = ''
			focusElement(payerInput)
		}
	}
</script>

<div class="payer-collection">
	<div class="payer-list" bind:this={payerListContainer}>
		{#if payers.length === 0}
			<p class="empty-state">No payers added yet. Add at least 1 payer to continue.</p>
		{:else}
			<ul>
				{#each payers as payer, index}
					<li class:newly-added={payer === lastAddedPayer}>
						<span class="payer-name">{payer}</span>
						<button class="remove-btn" onclick={() => removePayer(index)}>✕</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="payer-input">
		<input bind:this={payerInput} type="text" placeholder="Enter payer name" onkeydown={handlePayerInputKeydown} />
		<button onclick={handleAddPayerClick}>Add</button>
	</div>

	<div class="actions">
		<button class="secondary" onclick={onBack}>Back</button>
		<button onclick={onComplete} disabled={payers.length < 1} class:disabled={payers.length < 1}> Complete </button>
	</div>
</div>

<style>
	.payer-collection {
		max-width: 500px;
		margin: 0 auto;
		padding: 2rem;
	}

	.payer-list {
		margin-bottom: 1.5rem;
		min-height: 80px;
		max-height: 200px;
		overflow-y: auto;
	}

	.payer-list ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.payer-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		margin-bottom: 0.5rem;
		background: var(--color-surface-1);
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius);
		transition: all var(--transition-fast);
	}

	.payer-list li.newly-added {
		animation: slideInAndHighlight 0.3s ease-out;
		background: var(--color-primary-light);
	}

	@keyframes slideInAndHighlight {
		0% {
			transform: translateY(-10px);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.payer-name {
		font-size: 1rem;
		color: var(--color-text-primary);
		flex: 1;
	}

	.remove-btn {
		background: none;
		border: none;
		color: var(--color-error);
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		transition: all var(--transition-fast);
		border-radius: var(--border-radius);
	}

	.remove-btn:hover {
		background: var(--color-error-light);
	}

	.empty-state {
		text-align: center;
		color: var(--color-text-tertiary);
		font-style: italic;
		padding: 2rem;
	}

	.payer-input {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.payer-input input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--border-radius);
		font-size: 1rem;
	}

	.payer-input button {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: var(--color-surface);
		border: none;
		border-radius: var(--border-radius);
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.payer-input button:hover {
		background: var(--color-primary-hover);
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.actions button {
		padding: 0.75rem 2rem;
		font-size: 1rem;
		border-radius: var(--border-radius);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-weight: 500;
	}

	.actions button:not(.secondary) {
		background: var(--color-primary);
		color: var(--color-surface);
		border: none;
	}

	.actions button:not(.secondary):hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.actions button.secondary {
		background: transparent;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.actions button.secondary:hover {
		background: var(--color-surface-1);
	}

	.actions button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.payer-collection {
			padding: 1rem;
		}

		.payer-list,
		.payer-input,
		.actions {
			width: 100%;
			box-sizing: border-box;
		}

		.payer-input button {
			width: auto;
			flex-shrink: 0;
		}

		.payer-input input {
			min-width: 0;
		}

		.actions {
			flex-direction: column;
		}

		.actions button {
			width: 100%;
			box-sizing: border-box;
		}

		.payer-list li {
			padding: 0.6rem 0.8rem;
		}

		.payer-name {
			font-size: 0.95rem;
		}

		.remove-btn {
			font-size: 1.1rem;
			padding: 0.2rem 0.4rem;
		}
	}
</style>
