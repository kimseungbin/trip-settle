import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { setupOpenAPI } from '@src/docs/openapi/setup-openapi'
import { generateOpenAPIDocumentation } from '@src/docs/openapi/generate'

jest.mock('@nestjs/swagger', () => ({
	SwaggerModule: {
		createDocument: jest.fn(),
	},
	DocumentBuilder: jest.fn().mockReturnValue({
		setTitle: jest.fn().mockReturnThis(),
		setDescription: jest.fn().mockReturnThis(),
		setVersion: jest.fn().mockReturnThis(),
		build: jest.fn().mockReturnValue({ swagger: 'swaggerConfig' }),
	}),
}))

jest.mock('./generate.ts', () => ({
	generateOpenAPIDocumentation: jest.fn(),
}))

describe('setupOpenAPI', () => {
	let app: INestApplication

	beforeEach(() => {
		// Mock app as an empty object
		app = {} as INestApplication
	})

	it('should set up Swagger and call generateOpenAPIDocumentation', async () => {
		const mockDocument = { openapi: '3.1.0' }
		;(SwaggerModule.createDocument as jest.Mock).mockReturnValue(mockDocument)

		await setupOpenAPI(app)

		expect(DocumentBuilder).toHaveBeenCalled()
		expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, expect.any(Object), expect.any(Object))
		expect(generateOpenAPIDocumentation).toHaveBeenCalledWith(mockDocument)
	})
})
