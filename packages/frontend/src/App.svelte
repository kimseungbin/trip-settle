<script lang="ts">
	import { onMount } from 'svelte'
	import ExpenseTracker from './components/ExpenseTracker.svelte'
	import Onboarding from './components/Onboarding.svelte'
	import DevTools from './components/DevTools.svelte'
	import { config } from './config'
	import { initRouter, destroyRouter, getRoute, navigate } from './lib/router.svelte'

	const isLocalMode = config.environment === 'local'

	// Initialize router on mount
	onMount(() => {
		initRouter()

		// Check if this is a first-time user
		const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
		const currentRoute = getRoute()

		// Handle unknown routes first (redirect to home)
		if (currentRoute !== '/' && currentRoute !== '/onboarding') {
			navigate('/')
			return () => {
				destroyRouter()
			}
		}

		// Redirect to onboarding if first-time user and currently on home page
		if (!hasSeenOnboarding && currentRoute === '/') {
			navigate('/onboarding')
		}

		// Cleanup on unmount
		return () => {
			destroyRouter()
		}
	})

	// Get current route (reactive)
	const currentRoute = $derived(getRoute())
</script>

<main>
	{#if currentRoute === '/onboarding'}
		<Onboarding />
	{:else}
		<h1>Trip Settle</h1>
		<p>Expense settlement made easy</p>

		<ExpenseTracker />
	{/if}

	{#if isLocalMode}
		<DevTools />
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
	}

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
