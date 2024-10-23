import * as path from 'node:path'
import { mkdir, writeFile } from 'fs/promises'

/**
 * Generates the OpenAPI documentation JSON file in the `docs` directory.
 * It will create the directory if it doesn't exist.
 *
 * @param document The OpenAPI Specification object
 * @returns {Promise<void>} Resolved when the file is written
 */
export async function generateOpenAPIDocumentation(document: Record<string, any>): Promise<void> {
	const outputPath = path.resolve(process.cwd(), 'docs', 'openapi.json')
	await mkdir(path.dirname(outputPath), { recursive: true })
	await writeFile(outputPath, JSON.stringify(document), { encoding: 'utf8' })
}
