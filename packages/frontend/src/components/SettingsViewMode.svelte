<script lang="ts">
	import { t } from 'svelte-i18n'
	import { setLocale } from '../i18n'
	import type { CurrencyMode } from '../stores/settings.svelte'

	let {
		currencyMode,
		defaultCurrency,
		currentLocale,
		onEdit,
	}: {
		currencyMode: CurrencyMode
		defaultCurrency: string
		currentLocale: string | null | undefined
		onEdit: () => void
	} = $props()

	/**
	 * Handle language change
	 */
	function handleLanguageChange(event: Event) {
		const target = event.target as HTMLSelectElement
		const value = target.value as 'en' | 'ko'
		setLocale(value)
	}
</script>

<div class="settings-section">
	<h2>{$t('settings.currentSettings')}</h2>

	<div class="setting-item">
		<span class="setting-label">{$t('settings.currencyMode.label')}</span>
		<span class="setting-value">
			{#if currencyMode === 'single'}
				💵 {$t('settings.currencyMode.single')}
			{:else}
				🌍 {$t('settings.currencyMode.multi')}
			{/if}
		</span>
	</div>

	<div class="setting-item">
		<span class="setting-label">{$t('settings.defaultCurrency.label')}</span>
		<span class="setting-value">{defaultCurrency}</span>
	</div>

	<div class="setting-item">
		<span class="setting-label">{$t('settings.language.label')}</span>
		<select class="language-dropdown" value={currentLocale} onchange={handleLanguageChange}>
			<option value="en">🇺🇸 English</option>
			<option value="ko">🇰🇷 한국어</option>
		</select>
	</div>

	<div class="actions">
		<button class="primary" onclick={onEdit}>{$t('settings.editButton')}</button>
	</div>

	<div class="info-box">
		<p class="info-icon">ℹ️</p>
		<p class="info-text">{$t('settings.info')}</p>
	</div>
</div>

<style>
	.settings-section {
		background: var(--color-surface);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: var(--shadow-md);
		margin-bottom: 2rem;
	}

	h2 {
		color: var(--color-text);
		font-size: 1.5rem;
		margin: 0 0 1.5rem;
		font-weight: 600;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--color-surface-1);
		border-radius: 8px;
		margin-bottom: 1rem;
		border-left: 4px solid var(--color-primary);
	}

	.setting-label {
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.setting-value {
		font-family: 'Courier New', monospace;
		color: var(--color-text);
		background: var(--color-surface);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid var(--color-border);
	}

	.language-dropdown {
		font-family: inherit;
		font-size: 1rem;
		color: var(--color-text);
		background: var(--color-surface);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		cursor: pointer;
		transition: all var(--transition-fast);
		min-width: 150px;
	}

	.language-dropdown:hover {
		border-color: var(--color-primary);
	}

	.language-dropdown:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
		border-color: var(--color-primary);
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	button {
		padding: 0.75rem 2rem;
		font-size: 1.1rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition:
			all var(--transition-fast),
			transform var(--transition-fast);
		font-weight: 500;
	}

	button.primary {
		background-color: var(--color-primary);
		color: var(--color-surface);
	}

	button.primary:hover {
		background-color: var(--color-primary-hover);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	button.primary:focus {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	.info-box {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		border-radius: 8px;
		margin-top: 2rem;
		align-items: flex-start;
		background: var(--color-success-light);
		border-left: 4px solid var(--color-success);
	}

	.info-icon {
		font-size: 1.5rem;
		margin: 0;
	}

	.info-text {
		margin: 0;
		color: var(--color-text-secondary);
		line-height: 1.6;
		flex: 1;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.settings-section {
			padding: 1.5rem;
		}

		.setting-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.setting-value {
			width: 100%;
			box-sizing: border-box;
		}

		.actions {
			flex-direction: column;
		}

		button {
			width: 100%;
			box-sizing: border-box;
		}
	}
</style>
