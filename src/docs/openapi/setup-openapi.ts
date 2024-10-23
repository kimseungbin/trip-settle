import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'
import { generateOpenAPIDocumentation } from './generate'

/**
 * Sets up OpenAPI (Swagger) documentation for the given NestJS application.
 *
 * @param {INestApplication} app - The NestJS application instance to configure with OpenAPI documentation.
 * @return {Promise<void>} A promise that resolves when the OpenAPI documentation has been successfully set up.
 */
export async function setupOpenAPI(app: INestApplication): Promise<void> {
	const config = new DocumentBuilder()
		.setTitle('Trip Settle')
		.setDescription('The Trip Settle API Documentation')
		.setVersion('1.0')
		.build()

	const options: SwaggerDocumentOptions = {
		deepScanRoutes: true,
		operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
	}

	const document = SwaggerModule.createDocument(app, config, options)
	await generateOpenAPIDocumentation(document)
}
