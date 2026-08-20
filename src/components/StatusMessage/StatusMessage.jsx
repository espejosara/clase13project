function StatusMessage({ title, description, variant = 'info' }) {
	return (
		<section className={`status-message status-message--${variant}`}>
			<h2 className="status-message__title">{title}</h2>
			<p className="status-message__description">{description}</p>
		</section>
	)
}

export default StatusMessage