import styles from './StatusMessage.module.css'

function StatusMessage({ title, description, variant = 'info' }) {
	const isWarning = variant === 'warning'

	return (
		<section
			className={`${styles.statusMessage} ${styles[`statusMessage--${variant}`] || styles['statusMessage--info']}`}
			role={isWarning ? 'alert' : 'status'}
			aria-live={isWarning ? 'assertive' : 'polite'}
		>
			<h2 className={styles.title}>{title}</h2>
			<p className={styles.description}>{description}</p>
		</section>
	)
}

export default StatusMessage
