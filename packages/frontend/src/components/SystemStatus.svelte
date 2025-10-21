<script lang="ts">
	import { onMount } from 'svelte'
	import { config } from '../config'

	let healthStatus = $state('loading')
	let databaseStatus = $state('loading')
	let apiUrl = $state('')

	async function checkHealth() {
		try {
			const response = await fetch('/api/health')
			const data = await response.json()
			healthStatus = data.status === 'ok' ? 'ok' : 'error'
			databaseStatus = data.database === 'ok' ? 'ok' : 'error'
		} catch (error) {
			healthStatus = 'error'
			databaseStatus = 'error'
			console.error('Health check failed:', error)
		}
	}

	onMount(() => {
		apiUrl = config.apiUrl
		checkHealth()
	})
</script>

<div class="status" data-testid="system-status">
	<h3>System Status</h3>
	<p class="api-url">{apiUrl}</p>

	<div class="status-row">
		<span class="label">Backend:</span>
		<div class="health {healthStatus}">
			{#if healthStatus === 'loading'}
				<span>⏳ Checking...</span>
			{:else if healthStatus === 'ok'}
				<span>✅ Healthy</span>
			{:else}
				<span>❌ Error</span>
			{/if}
		</div>
	</div>

	<div class="status-row">
		<span class="label">Database:</span>
		<div class="health {databaseStatus}">
			{#if databaseStatus === 'loading'}
				<span>⏳ Checking...</span>
			{:else if databaseStatus === 'ok'}
				<span>✅ Connected</span>
			{:else}
				<span>❌ Disconnected</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.status {
		margin: 2em 0;
		padding: 1.5em;
		border-radius: 8px;
		background: #f5f5f5;
	}

	h3 {
		margin: 1em 0 0.5em;
		color: #333;
	}

	.api-url {
		font-family: monospace;
		font-size: 0.9em;
		color: #666;
		margin: 0.5em 0 1em;
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: 1em;
		margin-bottom: 0.75em;
	}

	.status-row:last-child {
		margin-bottom: 0;
	}

	.status-row .label {
		font-weight: 600;
		min-width: 80px;
		color: #333;
	}

	.health {
		padding: 0.5em 1em;
		border-radius: 6px;
		font-weight: bold;
		flex: 1;
	}

	.health.loading {
		background: #fff3cd;
		color: #856404;
	}

	.health.ok {
		background: #d4edda;
		color: #155724;
	}

	.health.error {
		background: #f8d7da;
		color: #721c24;
	}
</style>
