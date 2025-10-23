import { DEFAULT_CURRENCY } from '../data/currencies'

/**
 * Currency mode determines how expenses are tracked
 * - 'single': All expenses use the same default currency (no currency selector shown)
 * - 'multi': Each expense can have a different currency (currency selector shown)
 */
export type CurrencyMode = 'single' | 'multi'

/**
 * Feature Settings - Core app behavior that cannot be changed after onboarding
 * These settings affect data structure and business logic
 */
export interface FeatureSettings {
	/** Whether user has completed onboarding */
	isOnboarded: boolean
	/** Currency mode for the trip (immutable after onboarding) */
	currencyMode: CurrencyMode
	/** Default currency for expenses (immutable after onboarding) */
	defaultCurrency: string
}

/**
 * System Preferences - UI/UX settings that can be changed anytime
 * These settings only affect user experience, not app functionality
 */
export interface SystemPreferences {
	/** Whether keyboard hint has been dismissed */
	hasSeenKeyboardHint: boolean
}

/**
 * Complete app settings combining feature settings and system preferences
 */
export interface AppSettings {
	features: FeatureSettings
	system: SystemPreferences
}

/**
 * Default feature settings
 */
const DEFAULT_FEATURE_SETTINGS: FeatureSettings = {
	isOnboarded: false,
	currencyMode: 'multi',
	defaultCurrency: DEFAULT_CURRENCY,
}

/**
 * Default system preferences
 */
const DEFAULT_SYSTEM_PREFERENCES: SystemPreferences = {
	hasSeenKeyboardHint: false,
}

/**
 * Storage key for app settings in localStorage
 */
const STORAGE_KEY = 'appSettings'

/**
 * Legacy storage key for backward compatibility
 */
const LEGACY_ONBOARDING_KEY = 'hasSeenOnboarding'
const LEGACY_KEYBOARD_HINT_KEY = 'keyboardHintDismissed'

/**
 * Load settings from localStorage with backward compatibility
 */
function loadSettings(): AppSettings {
	// Safety check for browser environment
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return {
			features: { ...DEFAULT_FEATURE_SETTINGS },
			system: { ...DEFAULT_SYSTEM_PREFERENCES },
		}
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			const parsed = JSON.parse(stored) as AppSettings
			return {
				features: { ...DEFAULT_FEATURE_SETTINGS, ...parsed.features },
				system: { ...DEFAULT_SYSTEM_PREFERENCES, ...parsed.system },
			}
		}

		// Check for legacy storage keys
		const legacyOnboarded = localStorage.getItem(LEGACY_ONBOARDING_KEY) === 'true'
		const legacyKeyboardHint = localStorage.getItem(LEGACY_KEYBOARD_HINT_KEY) === 'true'

		if (legacyOnboarded || legacyKeyboardHint) {
			return {
				features: {
					...DEFAULT_FEATURE_SETTINGS,
					isOnboarded: legacyOnboarded,
				},
				system: {
					...DEFAULT_SYSTEM_PREFERENCES,
					hasSeenKeyboardHint: legacyKeyboardHint,
				},
			}
		}
	} catch (error) {
		console.error('Failed to load settings from localStorage:', error)
	}

	return {
		features: { ...DEFAULT_FEATURE_SETTINGS },
		system: { ...DEFAULT_SYSTEM_PREFERENCES },
	}
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: AppSettings): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
	} catch (error) {
		console.error('Failed to save settings to localStorage:', error)
	}
}

/**
 * Create a reactive settings store using Svelte 5 runes
 * This store manages both feature settings (immutable after onboarding) and system preferences (always mutable)
 */
export function settingsStore() {
	let settings = $state<AppSettings>({
		features: { ...DEFAULT_FEATURE_SETTINGS },
		system: { ...DEFAULT_SYSTEM_PREFERENCES },
	})

	// Flag to track if we've loaded from localStorage yet
	let isLoaded = false

	// Lazy load function - only loads once on first access
	function ensureLoaded() {
		if (!isLoaded && typeof window !== 'undefined') {
			settings = loadSettings()
			isLoaded = true
		}
	}

	return {
		// Expose feature settings (read-only for consumers)
		get isOnboarded() {
			ensureLoaded()
			return settings.features.isOnboarded
		},
		get currencyMode() {
			ensureLoaded()
			return settings.features.currencyMode
		},
		get defaultCurrency() {
			ensureLoaded()
			return settings.features.defaultCurrency
		},

		// Expose system preferences (read-only for consumers)
		get hasSeenKeyboardHint() {
			ensureLoaded()
			return settings.system.hasSeenKeyboardHint
		},

		/**
		 * Complete onboarding with feature settings
		 * This can only be called once - settings become immutable afterward
		 */
		completeOnboarding(currencyMode: CurrencyMode, defaultCurrency: string) {
			if (settings.features.isOnboarded) {
				console.warn('Onboarding already completed. Feature settings are immutable.')
				return
			}

			settings = {
				...settings,
				features: {
					isOnboarded: true,
					currencyMode,
					defaultCurrency,
				},
			}

			saveSettings(settings)
		},

		/**
		 * Update system preferences (can be called anytime)
		 */
		updateSystemPreferences(preferences: Partial<SystemPreferences>) {
			settings = {
				...settings,
				system: {
					...settings.system,
					...preferences,
				},
			}

			saveSettings(settings)
		},

		/**
		 * Reset all settings to defaults
		 * This is primarily for development/testing purposes
		 */
		resetSettings() {
			settings = {
				features: { ...DEFAULT_FEATURE_SETTINGS },
				system: { ...DEFAULT_SYSTEM_PREFERENCES },
			}

			localStorage.removeItem(STORAGE_KEY)
			localStorage.removeItem(LEGACY_ONBOARDING_KEY)
			localStorage.removeItem(LEGACY_KEYBOARD_HINT_KEY)
		},

		/**
		 * Reset only system preferences (keep feature settings intact)
		 */
		resetSystemPreferences() {
			settings = {
				...settings,
				system: { ...DEFAULT_SYSTEM_PREFERENCES },
			}

			saveSettings(settings)
		},

		/**
		 * Toggle onboarding status (DEV TOOLS ONLY)
		 * This bypasses the normal immutability rules for development/testing purposes
		 */
		__dev_toggleOnboarding() {
			settings = {
				...settings,
				features: {
					...settings.features,
					isOnboarded: !settings.features.isOnboarded,
				},
			}

			saveSettings(settings)
		},
	}
}

/**
 * Global settings store instance (lazily initialized)
 * This approach avoids WebKit issues with early reactive state initialization
 */
let _settings: ReturnType<typeof settingsStore> | undefined

function getSettingsInstance() {
	if (!_settings) {
		// Only initialize when actually accessed (not at module load time)
		_settings = settingsStore()
	}
	return _settings
}

/**
 * Settings proxy that delegates to lazily-initialized store
 * This works around WebKit page crash issues with Svelte 5 $state runes during page reload
 */
export const settings = {
	get isOnboarded() {
		return getSettingsInstance().isOnboarded
	},
	get currencyMode() {
		return getSettingsInstance().currencyMode
	},
	get defaultCurrency() {
		return getSettingsInstance().defaultCurrency
	},
	get hasSeenKeyboardHint() {
		return getSettingsInstance().hasSeenKeyboardHint
	},
	completeOnboarding(currencyMode: CurrencyMode, defaultCurrency: string) {
		return getSettingsInstance().completeOnboarding(currencyMode, defaultCurrency)
	},
	updateSystemPreferences(preferences: Partial<SystemPreferences>) {
		return getSettingsInstance().updateSystemPreferences(preferences)
	},
	resetSettings() {
		return getSettingsInstance().resetSettings()
	},
	resetSystemPreferences() {
		return getSettingsInstance().resetSystemPreferences()
	},
	__dev_toggleOnboarding() {
		return getSettingsInstance().__dev_toggleOnboarding()
	},
}
