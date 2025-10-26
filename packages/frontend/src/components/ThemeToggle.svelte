<script lang="ts">
	import { theme, type ThemeMode } from '../stores/theme.svelte'

	const themes: ThemeMode[] = ['auto', 'light', 'dark']

	function cycleTheme() {
		const currentIndex = themes.indexOf(theme.mode)
		const nextIndex = (currentIndex + 1) % themes.length
		theme.mode = themes[nextIndex]
	}

	const themeIcons = {
		light: '☀️',
		dark: '🌙',
		auto: '🌓',
	}

	const themeLabels = {
		light: 'Light',
		dark: 'Dark',
		auto: 'Auto',
	}
</script>

<button class="theme-toggle" onclick={cycleTheme} aria-label="Toggle theme">
	<span class="icon" aria-hidden="true">{themeIcons[theme.mode]}</span>
	<span class="label">{themeLabels[theme.mode]}</span>
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		gap: 0.5em;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		color: var(--color-text);
		padding: 0.5em 1em;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast),
			transform var(--transition-fast);
	}

	.theme-toggle:hover {
		background: var(--color-surface-1);
		border-color: var(--color-primary);
		transform: translateY(-1px);
	}

	.theme-toggle:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	.theme-toggle:active {
		transform: translateY(0);
	}

	.icon {
		font-size: 1.2em;
		line-height: 1;
	}

	.label {
		user-select: none;
	}

	@media (max-width: 640px) {
		.label {
			display: none;
		}

		.theme-toggle {
			padding: 0.5em;
		}

		.icon {
			font-size: 1.5em;
		}
	}
</style>
