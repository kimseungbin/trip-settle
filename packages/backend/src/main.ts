import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module.js'
import { config } from './config/index.js'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.setGlobalPrefix('api')
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	)

	app.enableCors({
		origin: config.corsOrigin,
		credentials: true,
	})

	await app.listen(config.port)
	console.log(`Application is running on: http://localhost:${config.port}`)
	console.log(`Environment: ${config.environment}`)
}

bootstrap()
