import type { Currency } from '../types/expense'

export const currencies: Currency[] = [
	{ code: 'USD', name: 'US Dollar' },
	{ code: 'EUR', name: 'Euro' },
	{ code: 'JPY', name: 'Japanese Yen' },
	{ code: 'GBP', name: 'British Pound' },
	{ code: 'AUD', name: 'Australian Dollar' },
	{ code: 'CAD', name: 'Canadian Dollar' },
	{ code: 'CHF', name: 'Swiss Franc' },
	{ code: 'CNY', name: 'Chinese Yuan' },
	{ code: 'HKD', name: 'Hong Kong Dollar' },
	{ code: 'NZD', name: 'New Zealand Dollar' },
	{ code: 'SEK', name: 'Swedish Krona' },
	{ code: 'KRW', name: 'South Korean Won' },
	{ code: 'SGD', name: 'Singapore Dollar' },
	{ code: 'NOK', name: 'Norwegian Krone' },
	{ code: 'MXN', name: 'Mexican Peso' },
	{ code: 'INR', name: 'Indian Rupee' },
	{ code: 'RUB', name: 'Russian Ruble' },
	{ code: 'ZAR', name: 'South African Rand' },
	{ code: 'TRY', name: 'Turkish Lira' },
	{ code: 'BRL', name: 'Brazilian Real' },
	{ code: 'TWD', name: 'New Taiwan Dollar' },
	{ code: 'DKK', name: 'Danish Krone' },
	{ code: 'PLN', name: 'Polish Zloty' },
	{ code: 'THB', name: 'Thai Baht' },
	{ code: 'IDR', name: 'Indonesian Rupiah' },
	{ code: 'HUF', name: 'Hungarian Forint' },
	{ code: 'CZK', name: 'Czech Koruna' },
	{ code: 'ILS', name: 'Israeli Shekel' },
	{ code: 'CLP', name: 'Chilean Peso' },
	{ code: 'PHP', name: 'Philippine Peso' },
	{ code: 'AED', name: 'UAE Dirham' },
	{ code: 'COP', name: 'Colombian Peso' },
	{ code: 'SAR', name: 'Saudi Riyal' },
	{ code: 'MYR', name: 'Malaysian Ringgit' },
	{ code: 'RON', name: 'Romanian Leu' },
	{ code: 'ARS', name: 'Argentine Peso' },
	{ code: 'VND', name: 'Vietnamese Dong' },
	{ code: 'MOP', name: 'Macanese Pataca' },
	{ code: 'EGP', name: 'Egyptian Pound' },
	{ code: 'PKR', name: 'Pakistani Rupee' },
	{ code: 'BDT', name: 'Bangladeshi Taka' },
	{ code: 'NGN', name: 'Nigerian Naira' },
	{ code: 'UAH', name: 'Ukrainian Hryvnia' },
	{ code: 'PEN', name: 'Peruvian Sol' },
	{ code: 'KES', name: 'Kenyan Shilling' },
	{ code: 'GEL', name: 'Georgian Lari' },
	{ code: 'ISK', name: 'Icelandic Krona' },
	{ code: 'QAR', name: 'Qatari Riyal' },
	{ code: 'KWD', name: 'Kuwaiti Dinar' },
	{ code: 'OMR', name: 'Omani Rial' },
]

export const DEFAULT_CURRENCY = 'KRW'

export function getCurrencyByCode(code: string): Currency | undefined {
	return currencies.find(c => c.code === code)
}

export function searchCurrencies(query: string): Currency[] {
	const lowercaseQuery = query.toLowerCase()
	return currencies.filter(
		c => c.code.toLowerCase().includes(lowercaseQuery) || c.name.toLowerCase().includes(lowercaseQuery)
	)
}
