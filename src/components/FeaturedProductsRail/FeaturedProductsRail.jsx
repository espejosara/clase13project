import { useEffect, useRef, useState } from 'react'
import ProductCard from '../ProductCard/ProductCard'
import styles from './FeaturedProductsRail.module.css'

const AUTO_SCROLL_SPEED_PX_PER_SECOND = 42

function FeaturedProductsRail({ products }) {
	const railRef = useRef(null)
	const directionRef = useRef(1)
	const interactionPausedRef = useRef(false)
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(
		() => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
	)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handlePreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches)

		handlePreferenceChange()
		mediaQuery.addEventListener('change', handlePreferenceChange)

		return () => mediaQuery.removeEventListener('change', handlePreferenceChange)
	}, [])

	useEffect(() => {
		if (prefersReducedMotion || products.length < 2) return undefined

		let animationFrameId
		let previousTimestamp

		const moveRail = (timestamp) => {
			const rail = railRef.current

			if (!rail) return

			if (previousTimestamp === undefined || interactionPausedRef.current) {
				previousTimestamp = timestamp
				animationFrameId = window.requestAnimationFrame(moveRail)
				return
			}

			const elapsedSeconds = Math.min(timestamp - previousTimestamp, 50) / 1000
			const maxScrollLeft = rail.scrollWidth - rail.clientWidth
			previousTimestamp = timestamp

			if (maxScrollLeft > 0) {
				const nextScrollLeft = rail.scrollLeft
					+ directionRef.current * AUTO_SCROLL_SPEED_PX_PER_SECOND * elapsedSeconds

				if (nextScrollLeft >= maxScrollLeft) {
					rail.scrollLeft = maxScrollLeft
					directionRef.current = -1
				} else if (nextScrollLeft <= 0) {
					rail.scrollLeft = 0
					directionRef.current = 1
				} else {
					rail.scrollLeft = nextScrollLeft
				}
			}

			animationFrameId = window.requestAnimationFrame(moveRail)
		}

		animationFrameId = window.requestAnimationFrame(moveRail)

		return () => window.cancelAnimationFrame(animationFrameId)
	}, [prefersReducedMotion, products.length])

	if (!products.length) {
		return (
			<div className={styles.empty}>
				<p>No hay productos destacados disponibles.</p>
			</div>
		)
	}

	return (
		<div className={styles.carousel}>
			<p id="featured-rail-help" className="visually-hidden">
				{prefersReducedMotion
					? 'Puedes recorrer la cinta con la barra de desplazamiento.'
					: 'La cinta se mueve automáticamente y puedes recorrerla con la barra de desplazamiento.'}
			</p>

			<div
				ref={railRef}
				className={styles.rail}
				role="region"
				aria-label="Cinta de productos destacados"
				aria-describedby="featured-rail-help"
				onPointerEnter={() => { interactionPausedRef.current = true }}
				onPointerLeave={() => { interactionPausedRef.current = false }}
				onFocusCapture={() => { interactionPausedRef.current = true }}
				onBlurCapture={(event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) {
						interactionPausedRef.current = false
					}
				}}
			>
				{products.map((product) => (
					<div className={styles.item} key={product.id}>
						<ProductCard product={product} />
					</div>
				))}
			</div>
		</div>
	)
}

export default FeaturedProductsRail
