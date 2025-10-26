<script lang="ts">
	import SystemStatus from './SystemStatus.svelte'
	import SettingsViewer from './SettingsViewer.svelte'
</script>

<div class="dev-tools" data-testid="dev-tools">
	<div class="dev-tools-header">
		<h2>🔧 Developer Tools</h2>
		<span class="local-badge">Local Only</span>
	</div>

	<div class="dev-tools-content">
		<SystemStatus />
		<SettingsViewer />
	</div>
</div>

<style>
	.dev-tools {
		margin: 2em 0;
		padding: 1.5em;
		border-radius: 12px;
		background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
		border: 3px dashed #ffb300;
		box-shadow: 0 2px 8px rgba(255, 179, 0, 0.15);
	}

	.dev-tools-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5em;
		padding-bottom: 1em;
		border-bottom: 2px solid #ffb300;
	}

	h2 {
		margin: 0;
		color: #ff6f00;
		font-size: 1.5em;
		font-weight: 600;
	}

	.local-badge {
		background: #ff6f00;
		color: white;
		padding: 0.4em 0.8em;
		border-radius: 20px;
		font-size: 0.75em;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.dev-tools-content {
		display: flex;
		flex-direction: column;
		gap: 1.5em;
	}

	/* Override child component styles to fit within DevTools */
	.dev-tools-content :global(.status) {
		margin: 0;
		background: white;
		border: 1px solid #e0e0e0;
	}

	.dev-tools-content :global(.settings-viewer) {
		margin: 0;
		background: white;
		border: 1px solid #e0e0e0;
		border-left: 4px solid #4caf50;
	}

	.dev-tools-content :global(h3) {
		margin-top: 0;
	}

	@media (min-width: 640px) {
		.dev-tools-content {
			gap: 2em;
		}
	}
</style>
