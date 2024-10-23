import Joi from 'joi'

export enum Environment {
	Test = 'test',
	Development = 'development',
	Production = 'production',
}

export interface AppConfig {
	port: number
	environment: Environment
}

export const validationSchema = Joi.object({
	PORT: Joi.number().default(3000),
	NODE_ENV: Joi.string()
		.valid(...Object.values(Environment))
		.default(Environment.Development),
})
export default (): AppConfig => ({
	port: parseInt(process.env.PORT, 10),
	environment: process.env.NODE_ENV as Environment,
})
