import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SafeImage, { DEFAULT_IMAGE_FALLBACK } from './SafeImage'

describe('SafeImage', () => {
	it('sustituye una imagen que falla y conserva su texto alternativo', () => {
		const onError = vi.fn()
		render(<SafeImage src="/broken.jpg" alt="Figura de prueba" onError={onError} />)
		const image = screen.getByRole('img', { name: 'Figura de prueba' })

		fireEvent.error(image)

		expect(image).toHaveAttribute('src', DEFAULT_IMAGE_FALLBACK)
		expect(onError).toHaveBeenCalledOnce()
	})

	it('vuelve a probar cuando recibe una URL diferente', () => {
		const { rerender } = render(<SafeImage src="/broken.jpg" alt="Figura de prueba" />)
		const image = screen.getByRole('img', { name: 'Figura de prueba' })
		fireEvent.error(image)

		rerender(<SafeImage src="/working.jpg" alt="Figura de prueba" />)

		expect(image).toHaveAttribute('src', '/working.jpg')
	})

	it('utiliza directamente la alternativa cuando falta la URL', () => {
		render(<SafeImage src="" alt="Producto sin imagen" />)

		expect(screen.getByRole('img', { name: 'Producto sin imagen' }))
			.toHaveAttribute('src', DEFAULT_IMAGE_FALLBACK)
	})
})
