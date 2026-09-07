import { useId } from 'react'
import styles from './QuantitySelector.module.css'

function QuantitySelector({
	value,
	onChange,
	min = 1,
	max,
	disabled = false,
	label = 'Cantidad',
}) {
	const labelId = useId()
	const normalizedMin = Number.isInteger(min) ? min : 1
	const normalizedMax = Number.isInteger(max) ? Math.max(max, normalizedMin) : Infinity
	const normalizedValue = Math.min(Math.max(Number(value) || normalizedMin, normalizedMin), normalizedMax)
	const isAtMinimum = normalizedValue <= normalizedMin
	const isAtMaximum = normalizedValue >= normalizedMax
	const maximumText = Number.isFinite(normalizedMax)
		? isAtMaximum
			? 'Máximo disponible'
			: `Máximo ${normalizedMax} ${normalizedMax === 1 ? 'unidad' : 'unidades'}`
		: ''

	return (
		<div className={styles.selector}>
			<div className={styles.header}>
				<span id={labelId} className={styles.label}>{label}</span>
				{maximumText ? <span className={styles.help}>{maximumText}</span> : null}
			</div>
			<div className={styles.controls} role="group" aria-labelledby={labelId}>
				<button
					type="button"
					className={styles.button}
					onClick={() => onChange(normalizedValue - 1)}
					disabled={disabled || isAtMinimum}
					aria-label="Reducir cantidad"
				>
					<span aria-hidden="true">−</span>
				</button>
				<output className={styles.value} aria-live="polite" aria-label={`${label}: ${normalizedValue}`}>
					{normalizedValue}
				</output>
				<button
					type="button"
					className={styles.button}
					onClick={() => onChange(normalizedValue + 1)}
					disabled={disabled || isAtMaximum}
					aria-label="Aumentar cantidad"
				>
					<span aria-hidden="true">+</span>
				</button>
			</div>
		</div>
	)
}

export default QuantitySelector
