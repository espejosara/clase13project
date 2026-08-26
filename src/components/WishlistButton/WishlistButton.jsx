import { useId, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlistRequest } from '../../api/wishlist'
import Button from '../Button/Button'
import {
	setLocalWishlist,
	toggleLocalWishlist,
} from '../../store/slices/wishlistSlice'
import { idsAreEqual } from '../../utils/id'
import styles from './WishlistButton.module.css'

function WishlistButton({ productId, className = '', activeClassName = '' }) {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const errorId = useId()
	const dispatch = useDispatch()
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const isInWishlist = wishlistIds.some((id) => idsAreEqual(id, productId))

	// Toggle optimista: actualiza la UI primero y luego sincroniza con backend.
	const handleToggleWishlist = async () => {
		if (loading) return

		const previousWishlistIds = [...wishlistIds]

		try {
			setError('')
			setLoading(true)
			dispatch(toggleLocalWishlist(productId))

			const syncedWishlist = await toggleWishlistRequest(productId)

			if (syncedWishlist) {
				dispatch(setLocalWishlist(syncedWishlist))
			}
		} catch (toggleError) {
			// Revierte el cambio optimista si el servidor rechaza la operación.
			dispatch(setLocalWishlist(previousWishlistIds))
			setError('No se pudo actualizar favoritos. Inténtalo de nuevo.')
			console.error('No se pudo sincronizar la wishlist con el back', toggleError)
		} finally {
			setLoading(false)
		}
	}

	const composedClassName = [className, isInWishlist ? activeClassName : ''].filter(Boolean).join(' ')

	return (
		<div className={styles.wrapper}>
			<Button
				type="button"
				variant={isInWishlist ? 'primary' : 'outline'}
				className={composedClassName}
				onClick={handleToggleWishlist}
				disabled={loading}
				aria-pressed={isInWishlist}
				aria-describedby={error ? errorId : undefined}
				aria-label={isInWishlist ? 'Quitar de favoritos' : 'Añadir a favoritos'}
			>
				{loading ? 'Actualizando favoritos…' : isInWishlist ? 'Quitar de favoritos' : 'Añadir a favoritos'}
			</Button>
			{error ? <p id={errorId} className={styles.message} role="alert">{error}</p> : null}
		</div>
	)
}

export default WishlistButton
