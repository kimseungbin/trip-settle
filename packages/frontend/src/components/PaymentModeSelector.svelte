<script lang="ts">
	import type { PaymentMode } from '../stores/settings.svelte'

	let {
		value = $bindable<PaymentMode>('single'),
		onselect,
	}: {
		value?: PaymentMode
		onselect?: (mode: PaymentMode) => void
	} = $props()

	function selectMode(mode: PaymentMode) {
		value = mode
		if (onselect) {
			onselect(mode)
		}
	}
</script>

<div class="currency-mode-section">
	<h2 class="section-title">Select Payment Mode</h2>

	<div class="mode-options">
		<div class="mode-card">
			<button class="mode-option" tabindex="0" onclick={() => selectMode('single')}>
				<div class="mode-icon">👤</div>
				<div class="mode-title">Single Payer</div>
				<p class="mode-description desktop-only">All expenses paid by one person</p>
			</button>
		</div>

		<div class="mode-card">
			<button class="mode-option" tabindex="0" onclick={() => selectMode('multi')}>
				<div class="mode-icon">👥</div>
				<div class="mode-title">Multiple Payers</div>
				<p class="mode-description desktop-only">Track who paid for each expense</p>
			</button>
		</div>
	</div>
</div>

<style>
	.currency-mode-section {
		margin-bottom: 2rem;
	}

	.section-title {
		color: var(--color-text-primary);
		font-size: 1.5rem;
		margin-bottom: 1.5rem;
		font-weight: 600;
		text-align: center;
	}

	.mode-options {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.mode-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mode-option {
		background: var(--color-surface-1);
		border: 2px solid var(--color-border);
		padding: 2rem 1rem;
		border-radius: var(--border-radius);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: center;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mode-option:hover {
		border-color: var(--color-primary);
		background: var(--color-surface-2);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px var(--color-shadow);
	}

	.mode-option:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	.mode-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.mode-title {
		font-size: 1.3rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.mode-description {
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.desktop-only {
		display: block;
	}

	@media (max-width: 640px) {
		.mode-options {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.mode-option {
			padding: 1.5rem 1rem;
		}

		.mode-icon {
			font-size: 2.5rem;
		}

		.mode-title {
			font-size: 1.1rem;
		}

		.desktop-only {
			display: none;
		}
	}
</style>
