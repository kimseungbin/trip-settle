<script lang="ts">
	import { navigate } from '../lib/router.svelte'

	/**
	 * Complete onboarding and navigate to the main app
	 */
	function completeOnboarding() {
		// Mark onboarding as complete in localStorage
		localStorage.setItem('hasSeenOnboarding', 'true')

		// Navigate to home page
		navigate('/')
	}

	/**
	 * Skip onboarding and go directly to the main app
	 */
	function skipOnboarding() {
		completeOnboarding() // Same behavior as completing
	}

	/**
	 * Handle keyboard events for accessibility
	 */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			completeOnboarding()
		} else if (event.key === 'Escape') {
			skipOnboarding()
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="onboarding-container">
	<h1>Welcome to Trip Settle</h1>
	<p class="tagline">Expense settlement made easy</p>

	<div class="features">
		<div class="feature">
			<h2>📱 Track Expenses in Multiple Currencies</h2>
			<p>Add expenses in any currency and let us handle the conversion</p>
		</div>

		<div class="feature">
			<h2>👥 Split Costs Among Trip Participants</h2>
			<p>Easily divide expenses among friends and keep track of who paid what</p>
		</div>

		<div class="feature">
			<h2>⚡ Instant Settlement Calculations</h2>
			<p>Get real-time calculations on who owes whom and how much</p>
		</div>
	</div>

	<div class="actions">
		<button class="primary" onclick={completeOnboarding}>Get Started</button>
		<button class="secondary" onclick={skipOnboarding}>Skip</button>
	</div>

	<p class="keyboard-hint">Press <kbd>Enter</kbd> to get started or <kbd>Esc</kbd> to skip</p>
</div>

<style>
	.onboarding-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		color: #ff3e00;
		font-size: 3rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
	}

	.tagline {
		font-size: 1.5rem;
		color: #666;
		margin-bottom: 3rem;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
		text-align: left;
	}

	.feature h2 {
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.feature p {
		color: #666;
		line-height: 1.6;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	button {
		padding: 0.75rem 2rem;
		font-size: 1.1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 500;
	}

	button.primary {
		background-color: #ff3e00;
		color: white;
	}

	button.primary:hover {
		background-color: #e63600;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(255, 62, 0, 0.3);
	}

	button.primary:focus {
		outline: 2px solid #ff3e00;
		outline-offset: 2px;
	}

	button.secondary {
		background-color: transparent;
		color: #666;
		border: 1px solid #ccc;
	}

	button.secondary:hover {
		background-color: #f5f5f5;
		border-color: #999;
	}

	button.secondary:focus {
		outline: 2px solid #666;
		outline-offset: 2px;
	}

	.keyboard-hint {
		color: #999;
		font-size: 0.9rem;
	}

	kbd {
		background-color: #f5f5f5;
		border: 1px solid #ccc;
		border-radius: 3px;
		padding: 0.2rem 0.5rem;
		font-family: monospace;
		font-size: 0.85rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		h1 {
			font-size: 2rem;
		}

		.tagline {
			font-size: 1.2rem;
		}

		.features {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.actions {
			flex-direction: column;
		}

		button {
			width: 100%;
		}
	}
</style>
