<script lang="ts">
	import { locale } from 'svelte-i18n'
	import { setLocale } from '../../../i18n'
</script>

<div class="language-selector">
	<button
		class="language-option"
		class:active={$locale === 'en'}
		onclick={() => setLocale('en')}
		aria-label="Switch to English"
	>
		English
	</button>
	<span class="language-divider">|</span>
	<button
		class="language-option"
		class:active={$locale === 'ko'}
		onclick={() => setLocale('ko')}
		aria-label="한국어로 전환"
	>
		한국어
	</button>
</div>

<style>
	.language-selector {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding: 0.5rem 0;
	}

	.language-option {
		background: none;
		border: none;
		color: var(--color-text-tertiary);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: var(--border-radius);
		transition: all var(--transition-fast);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.language-option:hover {
		color: var(--color-text-secondary);
		background-color: var(--color-surface-1);
	}

	.language-option.active {
		color: var(--color-primary);
		font-weight: 600;
	}

	.language-option:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	.language-divider {
		color: var(--color-border);
		user-select: none;
	}
</style>
