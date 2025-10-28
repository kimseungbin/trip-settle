/**
 * @file Shared constants across the monorepo
 * Lightweight constants for port numbers, URLs, etc.
 * No runtime environment detection - just compile-time constants
 */

export const PORTS = {
	backend: 3000,
	frontend: 5173,
} as const

export const LOCAL_URLS = {
	frontend: `http://localhost:${PORTS.frontend}`,
	backend: `http://localhost:${PORTS.backend}`,
	api: `http://localhost:${PORTS.backend}/api`,
} as const

export type Ports = typeof PORTS
export type LocalUrls = typeof LOCAL_URLS
