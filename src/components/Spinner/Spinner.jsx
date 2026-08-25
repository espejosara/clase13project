import styles from './Spinner.module.css'

function Spinner({ label = 'Cargando...' }) {
	return (
		<div className={styles.spinner} role="status" aria-live="polite" aria-atomic="true">
			<span className={styles.circle} aria-hidden="true" />
			<span className={styles.label}>{label}</span>
		</div>
	)
}

export default Spinner
