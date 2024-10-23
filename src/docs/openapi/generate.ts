import * as path from 'node:path'
import { mkdir, writeFile } from 'fs/promises'

/**
 * Generates the OpenAPI documentation JSON file.
 *
 * @param document The generated OpenAPI document
 */
export async function generateOpenAPIDocumentation(document: Record<string, any>): Promise<void> {
	const outputPath = path.resolve(process.cwd(), 'docs', 'openapi.json')
	await mkdir(path.dirname(outputPath), { recursive: true })
	await writeFile(outputPath, JSON.stringify(document), { encoding: 'utf8' })
}
