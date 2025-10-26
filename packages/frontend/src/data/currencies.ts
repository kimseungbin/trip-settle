import type { Currency } from '../types/currency'

export const currencies: Currency[] = [
	{
		code: 'USD',
		name: 'US Dollar',
		nameKo: '미국 달러',
		searchTerms: ['USD', 'US Dollar', '미국 달러', '달러', 'dollar', 'usd'],
	},
	{ code: 'EUR', name: 'Euro', nameKo: '유로', searchTerms: ['EUR', 'Euro', '유로', 'euro', 'eur'] },
	{
		code: 'JPY',
		name: 'Japanese Yen',
		nameKo: '일본 엔',
		searchTerms: ['JPY', 'Japanese Yen', 'Yen', '일본 엔', '엔', 'yen', 'jpy'],
	},
	{
		code: 'GBP',
		name: 'British Pound',
		nameKo: '영국 파운드',
		searchTerms: ['GBP', 'British Pound', 'Pound', '영국 파운드', '파운드', 'pound', 'gbp'],
	},
	{
		code: 'AUD',
		name: 'Australian Dollar',
		nameKo: '호주 달러',
		searchTerms: ['AUD', 'Australian Dollar', '호주 달러', 'aud'],
	},
	{
		code: 'CAD',
		name: 'Canadian Dollar',
		nameKo: '캐나다 달러',
		searchTerms: ['CAD', 'Canadian Dollar', '캐나다 달러', 'cad'],
	},
	{
		code: 'CHF',
		name: 'Swiss Franc',
		nameKo: '스위스 프랑',
		searchTerms: ['CHF', 'Swiss Franc', 'Franc', '스위스 프랑', '프랑', 'franc', 'chf'],
	},
	{
		code: 'CNY',
		name: 'Chinese Yuan',
		nameKo: '중국 위안',
		searchTerms: ['CNY', 'Chinese Yuan', 'Yuan', '중국 위안', '위안', 'yuan', 'cny'],
	},
	{
		code: 'HKD',
		name: 'Hong Kong Dollar',
		nameKo: '홍콩 달러',
		searchTerms: ['HKD', 'Hong Kong Dollar', '홍콩 달러', 'hkd'],
	},
	{
		code: 'NZD',
		name: 'New Zealand Dollar',
		nameKo: '뉴질랜드 달러',
		searchTerms: ['NZD', 'New Zealand Dollar', '뉴질랜드 달러', 'nzd'],
	},
	{
		code: 'SEK',
		name: 'Swedish Krona',
		nameKo: '스웨덴 크로나',
		searchTerms: ['SEK', 'Swedish Krona', 'Krona', '스웨덴 크로나', '크로나', 'krona', 'sek'],
	},
	{
		code: 'KRW',
		name: 'South Korean Won',
		nameKo: '대한민국 원',
		searchTerms: ['KRW', 'Korean Won', 'Won', '대한민국 원', '원', '한국', 'won', 'krw', 'korea'],
	},
	{
		code: 'SGD',
		name: 'Singapore Dollar',
		nameKo: '싱가포르 달러',
		searchTerms: ['SGD', 'Singapore Dollar', '싱가포르 달러', 'sgd'],
	},
	{
		code: 'NOK',
		name: 'Norwegian Krone',
		nameKo: '노르웨이 크로네',
		searchTerms: ['NOK', 'Norwegian Krone', 'Krone', '노르웨이 크로네', 'krone', 'nok'],
	},
	{
		code: 'MXN',
		name: 'Mexican Peso',
		nameKo: '멕시코 페소',
		searchTerms: ['MXN', 'Mexican Peso', 'Peso', '멕시코 페소', '페소', 'peso', 'mxn'],
	},
	{
		code: 'INR',
		name: 'Indian Rupee',
		nameKo: '인도 루피',
		searchTerms: ['INR', 'Indian Rupee', 'Rupee', '인도 루피', '루피', 'rupee', 'inr'],
	},
	{
		code: 'RUB',
		name: 'Russian Ruble',
		nameKo: '러시아 루블',
		searchTerms: ['RUB', 'Russian Ruble', 'Ruble', '러시아 루블', '루블', 'ruble', 'rub'],
	},
	{
		code: 'ZAR',
		name: 'South African Rand',
		nameKo: '남아공 랜드',
		searchTerms: ['ZAR', 'South African Rand', 'Rand', '남아공 랜드', '랜드', 'rand', 'zar'],
	},
	{
		code: 'TRY',
		name: 'Turkish Lira',
		nameKo: '터키 리라',
		searchTerms: ['TRY', 'Turkish Lira', 'Lira', '터키 리라', '리라', 'lira', 'try'],
	},
	{
		code: 'BRL',
		name: 'Brazilian Real',
		nameKo: '브라질 레알',
		searchTerms: ['BRL', 'Brazilian Real', 'Real', '브라질 레알', '레알', 'real', 'brl'],
	},
	{
		code: 'TWD',
		name: 'New Taiwan Dollar',
		nameKo: '신 대만 달러',
		searchTerms: ['TWD', 'Taiwan Dollar', '대만 달러', 'twd'],
	},
	{
		code: 'DKK',
		name: 'Danish Krone',
		nameKo: '덴마크 크로네',
		searchTerms: ['DKK', 'Danish Krone', '덴마크 크로네', 'dkk'],
	},
	{
		code: 'PLN',
		name: 'Polish Zloty',
		nameKo: '폴란드 즐로티',
		searchTerms: ['PLN', 'Polish Zloty', 'Zloty', '폴란드 즐로티', '즐로티', 'zloty', 'pln'],
	},
	{
		code: 'THB',
		name: 'Thai Baht',
		nameKo: '태국 바트',
		searchTerms: ['THB', 'Thai Baht', 'Baht', '태국 바트', '바트', 'baht', 'thb'],
	},
	{
		code: 'IDR',
		name: 'Indonesian Rupiah',
		nameKo: '인도네시아 루피아',
		searchTerms: ['IDR', 'Indonesian Rupiah', 'Rupiah', '인도네시아 루피아', '루피아', 'rupiah', 'idr'],
	},
	{
		code: 'HUF',
		name: 'Hungarian Forint',
		nameKo: '헝가리 포린트',
		searchTerms: ['HUF', 'Hungarian Forint', 'Forint', '헝가리 포린트', '포린트', 'forint', 'huf'],
	},
	{
		code: 'CZK',
		name: 'Czech Koruna',
		nameKo: '체코 코루나',
		searchTerms: ['CZK', 'Czech Koruna', 'Koruna', '체코 코루나', '코루나', 'koruna', 'czk'],
	},
	{
		code: 'ILS',
		name: 'Israeli Shekel',
		nameKo: '이스라엘 셰켈',
		searchTerms: ['ILS', 'Israeli Shekel', 'Shekel', '이스라엘 셰켈', '셰켈', 'shekel', 'ils'],
	},
	{
		code: 'CLP',
		name: 'Chilean Peso',
		nameKo: '칠레 페소',
		searchTerms: ['CLP', 'Chilean Peso', '칠레 페소', 'clp'],
	},
	{
		code: 'PHP',
		name: 'Philippine Peso',
		nameKo: '필리핀 페소',
		searchTerms: ['PHP', 'Philippine Peso', '필리핀 페소', 'php'],
	},
	{
		code: 'AED',
		name: 'UAE Dirham',
		nameKo: 'UAE 디르함',
		searchTerms: ['AED', 'UAE Dirham', 'Dirham', 'UAE 디르함', '디르함', 'dirham', 'aed'],
	},
	{
		code: 'COP',
		name: 'Colombian Peso',
		nameKo: '콜롬비아 페소',
		searchTerms: ['COP', 'Colombian Peso', '콜롬비아 페소', 'cop'],
	},
	{
		code: 'SAR',
		name: 'Saudi Riyal',
		nameKo: '사우디 리얄',
		searchTerms: ['SAR', 'Saudi Riyal', 'Riyal', '사우디 리얄', '리얄', 'riyal', 'sar'],
	},
	{
		code: 'MYR',
		name: 'Malaysian Ringgit',
		nameKo: '말레이시아 링깃',
		searchTerms: ['MYR', 'Malaysian Ringgit', 'Ringgit', '말레이시아 링깃', '링깃', 'ringgit', 'myr'],
	},
	{
		code: 'RON',
		name: 'Romanian Leu',
		nameKo: '루마니아 레우',
		searchTerms: ['RON', 'Romanian Leu', 'Leu', '루마니아 레우', '레우', 'leu', 'ron'],
	},
	{
		code: 'ARS',
		name: 'Argentine Peso',
		nameKo: '아르헨티나 페소',
		searchTerms: ['ARS', 'Argentine Peso', '아르헨티나 페소', 'ars'],
	},
	{
		code: 'VND',
		name: 'Vietnamese Dong',
		nameKo: '베트남 동',
		searchTerms: ['VND', 'Vietnamese Dong', 'Dong', '베트남 동', '동', 'dong', 'vnd'],
	},
	{
		code: 'MOP',
		name: 'Macanese Pataca',
		nameKo: '마카오 파타카',
		searchTerms: ['MOP', 'Macanese Pataca', 'Pataca', '마카오 파타카', '파타카', 'pataca', 'mop'],
	},
	{
		code: 'EGP',
		name: 'Egyptian Pound',
		nameKo: '이집트 파운드',
		searchTerms: ['EGP', 'Egyptian Pound', '이집트 파운드', 'egp'],
	},
	{
		code: 'PKR',
		name: 'Pakistani Rupee',
		nameKo: '파키스탄 루피',
		searchTerms: ['PKR', 'Pakistani Rupee', '파키스탄 루피', 'pkr'],
	},
	{
		code: 'BDT',
		name: 'Bangladeshi Taka',
		nameKo: '방글라데시 타카',
		searchTerms: ['BDT', 'Bangladeshi Taka', 'Taka', '방글라데시 타카', '타카', 'taka', 'bdt'],
	},
	{
		code: 'NGN',
		name: 'Nigerian Naira',
		nameKo: '나이지리아 나이라',
		searchTerms: ['NGN', 'Nigerian Naira', 'Naira', '나이지리아 나이라', '나이라', 'naira', 'ngn'],
	},
	{
		code: 'UAH',
		name: 'Ukrainian Hryvnia',
		nameKo: '우크라이나 흐리브냐',
		searchTerms: ['UAH', 'Ukrainian Hryvnia', 'Hryvnia', '우크라이나 흐리브냐', '흐리브냐', 'hryvnia', 'uah'],
	},
	{
		code: 'PEN',
		name: 'Peruvian Sol',
		nameKo: '페루 솔',
		searchTerms: ['PEN', 'Peruvian Sol', 'Sol', '페루 솔', '솔', 'sol', 'pen'],
	},
	{
		code: 'KES',
		name: 'Kenyan Shilling',
		nameKo: '케냐 실링',
		searchTerms: ['KES', 'Kenyan Shilling', 'Shilling', '케냐 실링', '실링', 'shilling', 'kes'],
	},
	{
		code: 'GEL',
		name: 'Georgian Lari',
		nameKo: '조지아 라리',
		searchTerms: ['GEL', 'Georgian Lari', 'Lari', '조지아 라리', '라리', 'lari', 'gel'],
	},
	{
		code: 'ISK',
		name: 'Icelandic Krona',
		nameKo: '아이슬란드 크로나',
		searchTerms: ['ISK', 'Icelandic Krona', '아이슬란드 크로나', 'isk'],
	},
	{
		code: 'QAR',
		name: 'Qatari Riyal',
		nameKo: '카타르 리얄',
		searchTerms: ['QAR', 'Qatari Riyal', '카타르 리얄', 'qar'],
	},
	{
		code: 'KWD',
		name: 'Kuwaiti Dinar',
		nameKo: '쿠웨이트 디나르',
		searchTerms: ['KWD', 'Kuwaiti Dinar', 'Dinar', '쿠웨이트 디나르', '디나르', 'dinar', 'kwd'],
	},
	{
		code: 'OMR',
		name: 'Omani Rial',
		nameKo: '오만 리알',
		searchTerms: ['OMR', 'Omani Rial', 'Rial', '오만 리알', 'rial', 'omr'],
	},
]

export const DEFAULT_CURRENCY = 'KRW'

export function getCurrencyByCode(code: string): Currency | undefined {
	return currencies.find(c => c.code === code)
}

/**
 * Search currencies by query string (supports both English and Korean)
 * @param query - Search query (can be in English or Korean)
 * @returns Array of matching currencies
 */
export function searchCurrencies(query: string): Currency[] {
	const normalizedQuery = query.toLowerCase().trim()

	if (!normalizedQuery) {
		return currencies
	}

	return currencies.filter(currency =>
		currency.searchTerms.some(term => term.toLowerCase().includes(normalizedQuery))
	)
}

/**
 * Get display name for currency based on current locale
 * @param currency - Currency object
 * @param locale - Current locale ('en' or 'ko')
 * @returns Localized currency name
 */
export function getCurrencyDisplayName(currency: Currency, locale: string): string {
	return locale === 'ko' ? currency.nameKo : currency.name
}
