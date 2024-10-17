import { Config } from 'jest'

const config: Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '../src',
	transform: {
		'^.+\\.(t|j)s?$': '@swc/jest',
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: '.../coverage',
	testEnvironment: 'node',
	moduleNameMapper: {
		'@src/(.*)$': '<rootDir>/$1',
		'@trips/(.*)$': '<rootDir>/trips/$1',
	},
}

export default config
