import styles from './StatusMessage.module.css'

function StatusMessage({ title, description, variant = 'info' }) {
	return (
		<section className={`${styles.statusMessage} ${styles[`statusMessage--${variant}`] || styles['statusMessage--info']}`}>
			<h2 className={styles.title}>{title}</h2>
			<p className={styles.description}>{description}</p>
		</section>
	)
}

export default StatusMessage