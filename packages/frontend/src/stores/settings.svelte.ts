import { DEFAULT_CURRENCY } from '../data/currencies'

/**
 * Currency mode determines how expenses are tracked
 * - 'single': All expenses use the same default currency (no currency selector shown)
 * - 'multi': Each expense can have a different currency (currency selector shown)
 */
export type CurrencyMode = 'single' | 'multi'

/**
 * Payment mode determines how payers are tracked
 * - 'single': Single payer for all expenses (no payer selector shown)
 * - 'multi': Each expense can have a different payer (payer selector shown)
 */
export type PaymentMode = 'single' | 'multi'

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
	/** Payment mode for the trip (immutable after onboarding) */
	paymentMode: PaymentMode
	/** List of payer names (only used in multi-payer mode) */
	payers: string[]
}

/**
 * System Preferences - UI/UX settings that can be changed anytime
 * These settings only affect user experience, not app functionality
 */
export interface SystemPreferences {
	/** Individual keyboard hints dismissal status (hintId -> dismissed) */
	keyboardHints: {
		[hintId: string]: boolean
	}
	/** @deprecated Use keyboardHints['expenseForm'] instead. Kept for backward compatibility. */
	hasSeenKeyboardHint?: boolean
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
	paymentMode: 'single',
	payers: [],
}

/**
 * Default system preferences
 */
const DEFAULT_SYSTEM_PREFERENCES: SystemPreferences = {
	keyboardHints: {},
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

			// Migrate old hasSeenKeyboardHint boolean to new keyboardHints dictionary
			const systemPrefs = { ...DEFAULT_SYSTEM_PREFERENCES, ...parsed.system }
			if (systemPrefs.hasSeenKeyboardHint && !systemPrefs.keyboardHints?.expenseForm) {
				systemPrefs.keyboardHints = {
					...systemPrefs.keyboardHints,
					expenseForm: true,
				}
				// Remove deprecated field
				delete systemPrefs.hasSeenKeyboardHint
			}

			return {
				features: { ...DEFAULT_FEATURE_SETTINGS, ...parsed.features },
				system: systemPrefs,
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
					keyboardHints: legacyKeyboardHint ? { expenseForm: true } : {},
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
		get paymentMode() {
			ensureLoaded()
			return settings.features.paymentMode
		},
		get payers() {
			ensureLoaded()
			return settings.features.payers
		},

		// Expose system preferences (read-only for consumers)
		get hasSeenKeyboardHint() {
			ensureLoaded()
			// Backward compatibility: return expenseForm hint status
			return settings.system.keyboardHints?.expenseForm || false
		},

		/**
		 * Check if a specific keyboard hint has been dismissed
		 * @param hintId - The unique identifier for the hint (e.g., 'expenseForm', 'onboarding')
		 * @returns true if the hint has been dismissed, false otherwise
		 */
		hasSeenHint(hintId: string): boolean {
			ensureLoaded()
			return settings.system.keyboardHints?.[hintId] || false
		},

		/**
		 * Dismiss a specific keyboard hint
		 * @param hintId - The unique identifier for the hint to dismiss
		 */
		dismissHint(hintId: string): void {
			ensureLoaded()
			settings = {
				...settings,
				system: {
					...settings.system,
					keyboardHints: {
						...settings.system.keyboardHints,
						[hintId]: true,
					},
				},
			}
			saveSettings(settings)
		},

		/**
		 * Complete onboarding with feature settings
		 * This can only be called once - settings become immutable afterward
		 */
		completeOnboarding(
			currencyMode: CurrencyMode,
			defaultCurrency: string,
			paymentMode: PaymentMode,
			payers: string[]
		) {
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
					paymentMode,
					payers,
				},
			}

			saveSettings(settings)
		},

		/**
		 * Update system preferences (can be called anytime)
		 */
		updateSystemPreferences(preferences: Partial<SystemPreferences>) {
			// Handle backward compatibility: convert hasSeenKeyboardHint to keyboardHints.expenseForm
			const newPrefs = { ...preferences }
			if ('hasSeenKeyboardHint' in newPrefs) {
				newPrefs.keyboardHints = {
					...settings.system.keyboardHints,
					...newPrefs.keyboardHints,
					expenseForm: newPrefs.hasSeenKeyboardHint || false,
				}
				delete newPrefs.hasSeenKeyboardHint
			}

			settings = {
				...settings,
				system: {
					...settings.system,
					...newPrefs,
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
	get paymentMode() {
		return getSettingsInstance().paymentMode
	},
	get payers() {
		return getSettingsInstance().payers
	},
	get hasSeenKeyboardHint() {
		return getSettingsInstance().hasSeenKeyboardHint
	},
	hasSeenHint(hintId: string) {
		return getSettingsInstance().hasSeenHint(hintId)
	},
	dismissHint(hintId: string) {
		return getSettingsInstance().dismissHint(hintId)
	},
	completeOnboarding(
		currencyMode: CurrencyMode,
		defaultCurrency: string,
		paymentMode: PaymentMode,
		payers: string[]
	) {
		return getSettingsInstance().completeOnboarding(currencyMode, defaultCurrency, paymentMode, payers)
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
