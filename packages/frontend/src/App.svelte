<script lang="ts">
	import { onMount } from 'svelte'
	import ExpenseTracker from './components/ExpenseTracker.svelte'
	import Onboarding from './components/Onboarding.svelte'
	import Settings from './components/Settings.svelte'
	import DevTools from './components/DevTools.svelte'
	import ThemeToggle from './components/ThemeToggle.svelte'
	import Toast from './components/Toast.svelte'
	import { config } from './config'
	import { initRouter, destroyRouter, getRoute, navigate } from './lib/router.svelte'
	import { settings } from './stores/settings.svelte'
	import { initTheme } from './stores/theme.svelte'
	import { t } from 'svelte-i18n'
	import './styles/theme.css'

	const isLocalMode = config.environment === 'local'

	// Initialize router and theme on mount
	onMount(() => {
		initRouter()
		initTheme()

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
				<div class="header-actions">
					<ThemeToggle />
					<button class="settings-link" onclick={() => navigate('/settings')} aria-label="Settings">
						⚙️ {$t('settings.title')}
					</button>
				</div>
			</div>
		</div>

		<ExpenseTracker />
	{/if}

	{#if isLocalMode}
		<DevTools />
	{/if}

	<!-- Global toast notifications -->
	<Toast />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		background-color: var(--color-surface);
		color: var(--color-text);
		overflow-x: hidden; /* Prevent horizontal scroll on mobile */
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

	.header-actions {
		display: flex;
		gap: 1em;
		align-items: center;
	}

	h1 {
		color: var(--color-primary);
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		margin-bottom: 0.2em;
	}

	.settings-link {
		background: var(--color-surface);
		border: 2px solid var(--color-primary);
		color: var(--color-primary);
		padding: 0.75em 1.5em;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
		white-space: nowrap;
	}

	.settings-link:hover {
		background: var(--color-primary);
		color: var(--color-surface);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.settings-link:focus {
		outline: 2px solid var(--color-focus-ring);
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

		.header-actions {
			flex-direction: column;
			width: 100%;
		}

		.settings-link {
			width: 100%;
		}
	}
</style>
