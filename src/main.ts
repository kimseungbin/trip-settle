import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { setupOpenAPI } from './docs/openapi/setup-openapi' // Adjusted path for OpenAPI setup

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const configService = app.get(ConfigService)

	const environment = configService.get<string>('environment')
	if (environment === 'development') {
		await setupOpenAPI(app) // Call the OpenAPI setup
	}

	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
	app.useGlobalPipes(new ValidationPipe())

	const port = configService.get<number>('port')
	await app.listen(port)
}

bootstrap()
