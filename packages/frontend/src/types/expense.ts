export interface Expense {
	id: number
	name: string
	amount: number
	currency: string
	payer?: string // Optional: only present in multi-payer mode
}

export interface Currency {
	code: string
	name: string
}
