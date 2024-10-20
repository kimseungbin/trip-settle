import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'
import { ClassSerializerInterceptor } from '@nestjs/common'
import * as path from 'node:path'
import { mkdir, writeFile } from 'fs/promises'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

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

	// todo update it to not do it in production
	await generateOpenAPIDocumentation(document)

	await app.listen(3000)
}

async function generateOpenAPIDocumentation(document: Record<string, any>) {
	const outputPath = path.resolve(process.cwd(), 'docs', 'openapi.json')
	await mkdir(path.dirname(outputPath), { recursive: true })
	await writeFile(outputPath, JSON.stringify(document), { encoding: 'utf8' })
}

bootstrap()
