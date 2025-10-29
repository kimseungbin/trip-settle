<script lang="ts">
	import type { CurrencyMode } from '../../../stores/settings.svelte'
	import { t } from 'svelte-i18n'

	let {
		value = $bindable<CurrencyMode>('multi'),
		onselect,
		autofocus = false,
		variant = 'onboarding',
	}: {
		value?: CurrencyMode
		onselect?: (mode: CurrencyMode) => void
		autofocus?: boolean
		variant?: 'onboarding' | 'settings'
	} = $props()

	let firstButton = $state<HTMLButtonElement | undefined>(undefined)
	let expandedMode = $state<'single' | 'multi' | null>(null)

	// Auto-focus first button if requested
	$effect(() => {
		if (autofocus && firstButton) {
			firstButton.focus()
		}
	})

	function selectMode(mode: CurrencyMode) {
		value = mode
		if (onselect) {
			onselect(mode)
		}
	}

	function handleKeydown(e: KeyboardEvent, mode: CurrencyMode) {
		if (e.key === 'Enter') {
			e.preventDefault()
			e.stopPropagation()
			selectMode(mode)
		}
	}

	// Determine translation keys and icons based on variant
	const singleIcon = variant === 'onboarding' ? $t('onboarding.singleCurrency.icon') : '💵'
	const multiIcon = variant === 'onboarding' ? $t('onboarding.multiCurrency.icon') : '🌍'
	const singleTitle =
		variant === 'onboarding' ? $t('onboarding.singleCurrency.title') : $t('settings.currencyMode.single')
	const multiTitle =
		variant === 'onboarding' ? $t('onboarding.multiCurrency.title') : $t('settings.currencyMode.multi')
	const singleDesc =
		variant === 'onboarding' ? $t('onboarding.singleCurrency.description') : $t('settings.currencyMode.singleDesc')
	const multiDesc =
		variant === 'onboarding' ? $t('onboarding.multiCurrency.description') : $t('settings.currencyMode.multiDesc')
</script>

<div class="currency-mode-section">
	{#if variant === 'onboarding'}
		<h2 class="section-title">{$t('onboarding.currencyModeTitle')}</h2>
	{:else}
		<h3>{$t('settings.currencyMode.label')}</h3>
	{/if}

	<div class="mode-options">
		<div class="mode-card">
			<button
				bind:this={firstButton}
				class="mode-option"
				class:selected={value === 'single'}
				tabindex="0"
				onclick={() => selectMode('single')}
				onkeydown={e => handleKeydown(e, 'single')}
			>
				<div class="mode-icon">{singleIcon}</div>
				<div class="mode-title">{singleTitle}</div>
				{#if variant === 'onboarding'}
					<p class="mode-description desktop-only">{singleDesc}</p>
				{:else}
					<p class="mode-description">{singleDesc}</p>
				{/if}
			</button>
			{#if variant === 'onboarding' && expandedMode === 'single'}
				<p class="mode-description mobile-only">{singleDesc}</p>
			{/if}
			{#if variant === 'onboarding'}
				<button
					class="show-more-btn mobile-only"
					onclick={e => {
						e.stopPropagation()
						expandedMode = expandedMode === 'single' ? null : 'single'
					}}
				>
					{expandedMode === 'single' ? $t('onboarding.showLess') : $t('onboarding.showMore')}
				</button>
			{/if}
		</div>

		<div class="mode-card">
			<button
				class="mode-option"
				class:selected={value === 'multi'}
				tabindex="0"
				onclick={() => selectMode('multi')}
				onkeydown={e => handleKeydown(e, 'multi')}
			>
				<div class="mode-icon">{multiIcon}</div>
				<div class="mode-title">{multiTitle}</div>
				{#if variant === 'onboarding'}
					<p class="mode-description desktop-only">{multiDesc}</p>
				{:else}
					<p class="mode-description">{multiDesc}</p>
				{/if}
			</button>
			{#if variant === 'onboarding' && expandedMode === 'multi'}
				<p class="mode-description mobile-only">{multiDesc}</p>
			{/if}
			{#if variant === 'onboarding'}
				<button
					class="show-more-btn mobile-only"
					onclick={e => {
						e.stopPropagation()
						expandedMode = expandedMode === 'multi' ? null : 'multi'
					}}
				>
					{expandedMode === 'multi' ? $t('onboarding.showLess') : $t('onboarding.showMore')}
				</button>
			{/if}
		</div>
	</div>

	{#if variant === 'onboarding'}
		<p class="keyboard-hint">
			<span class="hint-icon">{$t('onboarding.keyboardHint.icon')}</span>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html $t('onboarding.keyboardHint.navigate', {
				values: {
					tab: `<kbd>${$t('keyboard.tab')}</kbd>`,
					enter: `<kbd>${$t('keyboard.enter')}</kbd>`,
				},
			})}
		</p>
	{/if}
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

	h3 {
		color: var(--color-text-primary);
		font-size: 1.2rem;
		margin-bottom: 1rem;
		font-weight: 600;
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

	.mode-option.selected {
		border-color: var(--color-primary);
		background: var(--color-surface-2);
		box-shadow: 0 0 0 3px var(--color-primary-light);
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

	.mobile-only {
		display: none;
	}

	.show-more-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0.5rem;
		transition: opacity var(--transition-fast);
	}

	.show-more-btn:hover {
		opacity: 0.8;
	}

	.keyboard-hint {
		text-align: center;
		font-size: 0.9rem;
		color: var(--color-text-tertiary);
		margin-top: 1rem;
	}

	.hint-icon {
		margin-right: 0.5rem;
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

		.mobile-only {
			display: block;
		}

		.mode-description.mobile-only {
			padding: 0.5rem;
			text-align: center;
		}
	}
</style>
