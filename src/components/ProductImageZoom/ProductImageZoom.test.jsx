import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ProductImageZoom from './ProductImageZoom'

describe('ProductImageZoom', () => {
	it('abre la imagen, bloquea el fondo y permite cerrarla desde el botón', async () => {
		const user = userEvent.setup()
		render(<ProductImageZoom src="/figure.jpg" alt="Figura de prueba" />)
		const trigger = screen.getByRole('button', {
			name: 'Ampliar imagen de Figura de prueba',
		})

		await user.click(trigger)

		expect(screen.getByRole('dialog', { name: 'Vista ampliada de Figura de prueba' })).toBeInTheDocument()
		expect(document.body).toHaveStyle({ overflow: 'hidden' })
		expect(screen.getByRole('button', { name: 'Cerrar imagen ampliada' })).toHaveFocus()

		await user.click(screen.getByRole('button', { name: 'Cerrar imagen ampliada' }))

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		expect(document.body.style.overflow).toBe('')
		await waitFor(() => expect(trigger).toHaveFocus())
	})

	it('se cierra con Escape', async () => {
		const user = userEvent.setup()
		render(<ProductImageZoom src="/figure.jpg" alt="Figura de prueba" />)

		await user.click(screen.getByRole('button', { name: 'Ampliar imagen de Figura de prueba' }))
		await user.keyboard('{Escape}')

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('se cierra al pulsar el fondo exterior', async () => {
		const user = userEvent.setup()
		render(<ProductImageZoom src="/figure.jpg" alt="Figura de prueba" />)

		await user.click(screen.getByRole('button', { name: 'Ampliar imagen de Figura de prueba' }))
		await user.click(screen.getByRole('dialog'))

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})
})
