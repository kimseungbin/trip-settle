export interface Currency {
	code: string
	name: string
	nameKo: string
	searchTerms: string[]
	decimalPlaces: number // Number of decimal places (0 for KRW/JPY, 2 for USD/EUR, 3 for some Middle Eastern currencies)
}
