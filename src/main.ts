import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'
import { ClassSerializerInterceptor } from '@nestjs/common'

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
	SwaggerModule.setup('api', app, document)

	await app.listen(3000)
}

bootstrap()
