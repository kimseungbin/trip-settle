<script lang="ts">
	import { onMount } from 'svelte'
	import ExpenseTracker from './components/ExpenseTracker.svelte'
	import Onboarding from './components/Onboarding.svelte'
	import Settings from './components/Settings.svelte'
	import DevTools from './components/DevTools.svelte'
	import { config } from './config'
	import { initRouter, destroyRouter, getRoute, navigate } from './lib/router.svelte'
	import { settings } from './stores/settings.svelte'
	import { t } from 'svelte-i18n'

	const isLocalMode = config.environment === 'local'

	// Initialize router on mount
	onMount(() => {
		initRouter()

		// Check if user has completed onboarding
		const currentRoute = getRoute()

		// Handle unknown routes first (redirect to home)
		if (currentRoute !== '/' && currentRoute !== '/onboarding' && currentRoute !== '/settings') {
			navigate('/')
			return () => {
				destroyRouter()
			}
		}

		// Redirect to onboarding if first-time user and currently on home page
		if (!settings.isOnboarded && currentRoute === '/') {
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
	{:else if currentRoute === '/settings'}
		<Settings />
	{:else}
		<div class="header">
			<div class="header-content">
				<div class="title-section">
					<h1>{$t('app.title')}</h1>
					<p>{$t('app.tagline')}</p>
				</div>
				<button class="settings-link" onclick={() => navigate('/settings')} aria-label="Settings">
					⚙️ {$t('settings.title')}
				</button>
			</div>
		</div>

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

	.header {
		margin-bottom: 2em;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2em;
	}

	.title-section {
		flex: 1;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		margin-bottom: 0.2em;
	}

	.settings-link {
		background: white;
		border: 2px solid #ff3e00;
		color: #ff3e00;
		padding: 0.75em 1.5em;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.settings-link:hover {
		background: #ff3e00;
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(255, 62, 0, 0.3);
	}

	.settings-link:focus {
		outline: 2px solid #ff3e00;
		outline-offset: 2px;
	}

	@media (min-width: 640px) {
		main {
			max-width: 700px;
		}
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 2.5em;
		}

		.header-content {
			flex-direction: column;
			align-items: stretch;
			gap: 1em;
		}

		.settings-link {
			width: 100%;
		}
	}
</style>
