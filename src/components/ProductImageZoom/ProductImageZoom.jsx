import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ProductImageZoom.module.css'

function ProductImageZoom({ src, alt, imageClassName = '' }) {
	const [isOpen, setIsOpen] = useState(false)
	const titleId = useId()
	const triggerRef = useRef(null)
	const closeButtonRef = useRef(null)

	const closeImage = () => {
		setIsOpen(false)
		window.requestAnimationFrame(() => triggerRef.current?.focus())
	}

	useEffect(() => {
		if (!isOpen) return undefined

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		closeButtonRef.current?.focus()

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				closeImage()
			}

			if (event.key === 'Tab') {
				event.preventDefault()
				closeButtonRef.current?.focus()
			}
		}

		document.addEventListener('keydown', handleKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen])

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				className={styles.trigger}
				onClick={() => setIsOpen(true)}
				aria-label={`Ampliar imagen de ${alt}`}
			>
				<img className={imageClassName} src={src} alt={alt} />
				<span className={styles.zoomHint} aria-hidden="true">
					<svg viewBox="0 0 24 24" focusable="false">
						<circle cx="10.8" cy="10.8" r="6.3" />
						<path d="m15.5 15.5 4 4M10.8 8v5.6M8 10.8h5.6" />
					</svg>
					<span>Ampliar</span>
				</span>
			</button>

			{isOpen
				? createPortal(
					<div
						className={styles.backdrop}
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						onMouseDown={(event) => {
							if (event.target === event.currentTarget) closeImage()
						}}
					>
						<h2 id={titleId} className={styles.srOnly}>
							Vista ampliada de {alt}
						</h2>
						<div className={styles.modalContent}>
							<button
								ref={closeButtonRef}
								type="button"
								className={styles.closeButton}
								onClick={closeImage}
								aria-label="Cerrar imagen ampliada"
							>
								<span aria-hidden="true">×</span>
							</button>
							<img className={styles.expandedImage} src={src} alt={alt} />
						</div>
					</div>,
					document.body,
				)
				: null}
		</>
	)
}

export default ProductImageZoom
