import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import * as path from 'node:path'
import { mkdir, writeFile } from 'fs/promises'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configService = app.get(ConfigService)

	const environment = configService.get<string>('environment')
	if (environment === 'development') {
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

	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
	app.useGlobalPipes(new ValidationPipe())

	const port = configService.get<number>('port')
	await app.listen(port)
}

async function generateOpenAPIDocumentation(document: Record<string, any>) {
	const outputPath = path.resolve(process.cwd(), 'docs', 'openapi.json')
	await mkdir(path.dirname(outputPath), { recursive: true })
	await writeFile(outputPath, JSON.stringify(document), { encoding: 'utf8' })
}

bootstrap()
