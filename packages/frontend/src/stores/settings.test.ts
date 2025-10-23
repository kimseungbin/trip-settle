import { describe, it, expect, beforeEach } from 'vitest'
import { settingsStore, type AppSettings } from './settings.svelte'

describe('Settings Store', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear()
	})

	describe('Initialization', () => {
		it('should initialize with default values when localStorage is empty', () => {
			const store = settingsStore()

			expect(store.isOnboarded).toBe(false)
			expect(store.currencyMode).toBe('multi')
			expect(store.defaultCurrency).toBe('KRW')
			expect(store.hasSeenKeyboardHint).toBe(false)
		})

		it('should load persisted settings from localStorage', () => {
			const persistedSettings: AppSettings = {
				features: {
					isOnboarded: true,
					currencyMode: 'single',
					defaultCurrency: 'USD',
				},
				system: {
					hasSeenKeyboardHint: true,
				},
			}
			localStorage.setItem('appSettings', JSON.stringify(persistedSettings))

			const store = settingsStore()

			expect(store.isOnboarded).toBe(true)
			expect(store.currencyMode).toBe('single')
			expect(store.defaultCurrency).toBe('USD')
			expect(store.hasSeenKeyboardHint).toBe(true)
		})

		it('should handle corrupted localStorage data gracefully', () => {
			localStorage.setItem('appSettings', 'invalid json')

			const store = settingsStore()

			expect(store.isOnboarded).toBe(false)
			expect(store.currencyMode).toBe('multi')
			expect(store.defaultCurrency).toBe('KRW')
			expect(store.hasSeenKeyboardHint).toBe(false)
		})

		it('should handle partial settings in localStorage', () => {
			const partialSettings = {
				features: {
					isOnboarded: true,
				},
			}
			localStorage.setItem('appSettings', JSON.stringify(partialSettings))

			const store = settingsStore()

			expect(store.isOnboarded).toBe(true)
			expect(store.currencyMode).toBe('multi') // Should use default
			expect(store.defaultCurrency).toBe('KRW') // Should use default
			expect(store.hasSeenKeyboardHint).toBe(false) // Should use default
		})
	})

	describe('Backward Compatibility', () => {
		it('should migrate legacy hasSeenOnboarding flag', () => {
			localStorage.setItem('hasSeenOnboarding', 'true')

			const store = settingsStore()

			expect(store.isOnboarded).toBe(true)
		})

		it('should migrate legacy keyboardHintDismissed flag', () => {
			localStorage.setItem('keyboardHintDismissed', 'true')

			const store = settingsStore()

			expect(store.hasSeenKeyboardHint).toBe(true)
		})

		it('should prioritize new appSettings over legacy keys', () => {
			localStorage.setItem('hasSeenOnboarding', 'true')
			localStorage.setItem('keyboardHintDismissed', 'true')
			const newSettings: AppSettings = {
				features: {
					isOnboarded: false,
					currencyMode: 'single',
					defaultCurrency: 'EUR',
				},
				system: {
					hasSeenKeyboardHint: false,
				},
			}
			localStorage.setItem('appSettings', JSON.stringify(newSettings))

			const store = settingsStore()

			expect(store.isOnboarded).toBe(false)
			expect(store.hasSeenKeyboardHint).toBe(false)
		})
	})

	describe('Complete Onboarding (Feature Settings)', () => {
		it('should update feature settings when completing onboarding with multi-currency mode', () => {
			const store = settingsStore()

			store.completeOnboarding('multi', 'USD')

			expect(store.isOnboarded).toBe(true)
			expect(store.currencyMode).toBe('multi')
			expect(store.defaultCurrency).toBe('USD')
		})

		it('should update feature settings when completing onboarding with single-currency mode', () => {
			const store = settingsStore()

			store.completeOnboarding('single', 'EUR')

			expect(store.isOnboarded).toBe(true)
			expect(store.currencyMode).toBe('single')
			expect(store.defaultCurrency).toBe('EUR')
		})

		it('should persist feature settings to localStorage after onboarding', () => {
			const store = settingsStore()

			store.completeOnboarding('single', 'JPY')

			const stored = JSON.parse(localStorage.getItem('appSettings')!)
			expect(stored.features).toEqual({
				isOnboarded: true,
				currencyMode: 'single',
				defaultCurrency: 'JPY',
			})
		})

		it('should not allow changing feature settings after onboarding is complete', () => {
			const store = settingsStore()

			store.completeOnboarding('single', 'USD')
			store.completeOnboarding('multi', 'EUR') // This should be ignored

			expect(store.currencyMode).toBe('single')
			expect(store.defaultCurrency).toBe('USD')
		})

		it('should preserve system preferences when completing onboarding', () => {
			const store = settingsStore()
			store.updateSystemPreferences({ hasSeenKeyboardHint: true })

			store.completeOnboarding('single', 'GBP')

			expect(store.hasSeenKeyboardHint).toBe(true)
		})
	})

	describe('Update System Preferences', () => {
		it('should update system preferences without affecting feature settings', () => {
			const store = settingsStore()
			store.completeOnboarding('single', 'USD')

			store.updateSystemPreferences({ hasSeenKeyboardHint: true })

			expect(store.hasSeenKeyboardHint).toBe(true)
			expect(store.currencyMode).toBe('single')
			expect(store.defaultCurrency).toBe('USD')
		})

		it('should allow updating system preferences even after onboarding', () => {
			const store = settingsStore()
			store.completeOnboarding('multi', 'EUR')

			store.updateSystemPreferences({ hasSeenKeyboardHint: true })
			expect(store.hasSeenKeyboardHint).toBe(true)

			store.updateSystemPreferences({ hasSeenKeyboardHint: false })
			expect(store.hasSeenKeyboardHint).toBe(false)
		})

		it('should persist system preferences to localStorage', () => {
			const store = settingsStore()

			store.updateSystemPreferences({ hasSeenKeyboardHint: true })

			const stored = JSON.parse(localStorage.getItem('appSettings')!)
			// Deprecated field is converted to keyboardHints.expenseForm
			expect(stored.system.keyboardHints.expenseForm).toBe(true)
		})

		it('should allow partial updates to system preferences', () => {
			const store = settingsStore()
			store.updateSystemPreferences({ hasSeenKeyboardHint: true })

			// Future: when more system prefs are added, this test ensures partial updates work
			const stored = JSON.parse(localStorage.getItem('appSettings')!)
			// Deprecated field is converted to keyboardHints.expenseForm
			expect(stored.system.keyboardHints.expenseForm).toBe(true)
		})
	})

	describe('Reset Settings', () => {
		it('should reset all settings to defaults', () => {
			const store = settingsStore()
			store.completeOnboarding('single', 'USD')
			store.updateSystemPreferences({ hasSeenKeyboardHint: true })

			store.resetSettings()

			expect(store.isOnboarded).toBe(false)
			expect(store.currencyMode).toBe('multi')
			expect(store.defaultCurrency).toBe('KRW')
			expect(store.hasSeenKeyboardHint).toBe(false)
		})

		it('should clear localStorage when resetting all settings', () => {
			const store = settingsStore()
			store.completeOnboarding('single', 'USD')

			store.resetSettings()

			expect(localStorage.getItem('appSettings')).toBeNull()
			expect(localStorage.getItem('hasSeenOnboarding')).toBeNull()
			expect(localStorage.getItem('keyboardHintDismissed')).toBeNull()
		})

		it('should allow onboarding again after reset', () => {
			const store = settingsStore()
			store.completeOnboarding('single', 'USD')
			store.resetSettings()

			store.completeOnboarding('multi', 'EUR')

			expect(store.isOnboarded).toBe(true)
			expect(store.currencyMode).toBe('multi')
			expect(store.defaultCurrency).toBe('EUR')
		})
	})

	describe('Reset System Preferences Only', () => {
		it('should reset only system preferences while keeping feature settings', () => {
			const store = settingsStore()
			store.completeOnboarding('single', 'USD')
			store.updateSystemPreferences({ hasSeenKeyboardHint: true })

			store.resetSystemPreferences()

			expect(store.hasSeenKeyboardHint).toBe(false)
			expect(store.isOnboarded).toBe(true)
			expect(store.currencyMode).toBe('single')
			expect(store.defaultCurrency).toBe('USD')
		})

		it('should persist changes when resetting system preferences', () => {
			const store = settingsStore()
			store.completeOnboarding('single', 'USD')
			store.updateSystemPreferences({ hasSeenKeyboardHint: true })

			store.resetSystemPreferences()

			const stored = JSON.parse(localStorage.getItem('appSettings')!)
			// After reset, keyboardHints should be empty
			expect(stored.system.keyboardHints).toEqual({})
			expect(stored.features.isOnboarded).toBe(true)
		})
	})

	describe('Reactivity', () => {
		it('should maintain reactive state after updates', () => {
			const store = settingsStore()

			expect(store.isOnboarded).toBe(false)

			store.completeOnboarding('single', 'USD')

			expect(store.isOnboarded).toBe(true)
			expect(store.currencyMode).toBe('single')
		})

		it('should reflect changes immediately after system preference updates', () => {
			const store = settingsStore()

			expect(store.hasSeenKeyboardHint).toBe(false)

			store.updateSystemPreferences({ hasSeenKeyboardHint: true })

			expect(store.hasSeenKeyboardHint).toBe(true)
		})
	})

	describe('Individual Keyboard Hints', () => {
		it('should check individual hint status (default: not dismissed)', () => {
			const store = settingsStore()

			expect(store.hasSeenHint('expenseForm')).toBe(false)
			expect(store.hasSeenHint('onboarding')).toBe(false)
			expect(store.hasSeenHint('currencySelector')).toBe(false)
		})

		it('should dismiss individual hints independently', () => {
			const store = settingsStore()

			store.dismissHint('expenseForm')

			expect(store.hasSeenHint('expenseForm')).toBe(true)
			expect(store.hasSeenHint('onboarding')).toBe(false)
			expect(store.hasSeenHint('currencySelector')).toBe(false)
		})

		it('should persist individual hint dismissals to localStorage', () => {
			const store = settingsStore()

			store.dismissHint('expenseForm')
			store.dismissHint('currencySelector')

			const stored = JSON.parse(localStorage.getItem('appSettings')!)
			expect(stored.system.keyboardHints.expenseForm).toBe(true)
			expect(stored.system.keyboardHints.currencySelector).toBe(true)
			expect(stored.system.keyboardHints.onboarding).toBeUndefined()
		})

		it('should reset all hints when resetting system preferences', () => {
			const store = settingsStore()

			store.dismissHint('expenseForm')
			store.dismissHint('onboarding')
			store.dismissHint('currencySelector')

			store.resetSystemPreferences()

			expect(store.hasSeenHint('expenseForm')).toBe(false)
			expect(store.hasSeenHint('onboarding')).toBe(false)
			expect(store.hasSeenHint('currencySelector')).toBe(false)
		})

		it('should load individual hints from localStorage', () => {
			localStorage.setItem(
				'appSettings',
				JSON.stringify({
					features: {
						isOnboarded: false,
						currencyMode: 'multi',
						defaultCurrency: 'KRW',
					},
					system: {
						keyboardHints: {
							expenseForm: true,
							onboarding: true,
						},
					},
				})
			)

			const store = settingsStore()

			expect(store.hasSeenHint('expenseForm')).toBe(true)
			expect(store.hasSeenHint('onboarding')).toBe(true)
			expect(store.hasSeenHint('currencySelector')).toBe(false)
		})

		it('should migrate legacy hasSeenKeyboardHint to expenseForm hint', () => {
			localStorage.setItem(
				'appSettings',
				JSON.stringify({
					features: {
						isOnboarded: false,
						currencyMode: 'multi',
						defaultCurrency: 'KRW',
					},
					system: {
						hasSeenKeyboardHint: true,
					},
				})
			)

			const store = settingsStore()

			// Legacy boolean should migrate to expenseForm hint
			expect(store.hasSeenHint('expenseForm')).toBe(true)
			expect(store.hasSeenHint('onboarding')).toBe(false)
		})

		it('should preserve hasSeenKeyboardHint getter for backward compatibility', () => {
			const store = settingsStore()

			store.dismissHint('expenseForm')

			// Old getter should still work and return expenseForm hint status
			expect(store.hasSeenKeyboardHint).toBe(true)
		})
	})
})
