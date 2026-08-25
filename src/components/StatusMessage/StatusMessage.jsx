import styles from './StatusMessage.module.css'

function StatusMessage({ title, description, variant = 'info' }) {
	const isUrgent = variant === 'warning' || variant === 'error'

	return (
		<section
			className={`${styles.statusMessage} ${styles[`statusMessage--${variant}`] || styles['statusMessage--info']}`}
			role={isUrgent ? 'alert' : 'status'}
			aria-live={isUrgent ? 'assertive' : 'polite'}
		>
			<h2 className={styles.title}>{title}</h2>
			<p className={styles.description}>{description}</p>
		</section>
	)
}

export default StatusMessage
