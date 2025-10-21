import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class AppService {
	constructor(@InjectDataSource() private dataSource: DataSource) {}

	getHello(): string {
		return 'Trip Settle API'
	}

	async getHealth() {
		let databaseStatus = 'error'
		try {
			// Try to execute a simple query to verify database connectivity
			await this.dataSource.query('SELECT 1')
			databaseStatus = 'ok'
		} catch (error) {
			console.error('Database health check failed:', error)
		}

		return {
			status: 'ok',
			database: databaseStatus,
		}
	}
}
