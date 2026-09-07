import styles from './UndoToast.module.css'

function UndoToast({ label, children, onUndo, isUndoing = false }) {
	return (
		<aside className={styles.toast} role="status" aria-label={label}>
			<span className={styles.icon} aria-hidden="true">✓</span>
			<p>{children}</p>
			<button
				type="button"
				className={styles.undoButton}
				onClick={onUndo}
				disabled={isUndoing}
			>
				{isUndoing ? 'Restaurando…' : 'Deshacer'}
			</button>
		</aside>
	)
}

export default UndoToast
