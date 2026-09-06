import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from './axios'

describe('configuración base de la API', () => {
	it('usa el proxy del mismo origen en producción', () => {
		expect(resolveApiBaseUrl({
			isProduction: true,
			configuredUrl: 'https://backend.example.com',
		})).toBe('/api')
	})

	it('permite configurar el backend durante desarrollo', () => {
		expect(resolveApiBaseUrl({
			isProduction: false,
			configuredUrl: 'http://localhost:4000',
		})).toBe('http://localhost:4000')
	})

	it('usa el backend local por defecto durante desarrollo', () => {
		expect(resolveApiBaseUrl({
			isProduction: false,
			configuredUrl: '',
		})).toBe('http://localhost:3000')
	})
})
