import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import styles from './ActionToast.module.css'

const AUTO_HIDE_MS = 2800

function normalizePath(path = '') {
	const pathname = path.split(/[?#]/)[0].replace(/\/+$/, '')
	return pathname || '/'
}

function ActionToast() {
	const notification = useSelector((state) => state.notification)
	const location = useLocation()
	const [dismissedNoticeId, setDismissedNoticeId] = useState(0)
	const isVisible = notification.id > dismissedNoticeId
	const isActionCurrentPage = normalizePath(location.pathname) === normalizePath(notification.actionTo)
	const shouldShowAction = notification.actionLabel && notification.actionTo && !isActionCurrentPage

	useEffect(() => {
		if (!isVisible) return undefined

		const timeoutId = window.setTimeout(() => {
			setDismissedNoticeId(notification.id)
		}, AUTO_HIDE_MS)

		return () => window.clearTimeout(timeoutId)
	}, [isVisible, notification.id])

	if (!isVisible) return null

	return (
		<aside key={notification.id} className={styles.toast} aria-label="Notificación">
			<span className={styles.icon} aria-hidden="true">✓</span>
			<div className={styles.content}>
				<p className={styles.message} role="status" aria-live="polite" aria-atomic="true">
					{notification.message}
				</p>
				{shouldShowAction ? (
					<Link
						to={notification.actionTo}
						className={styles.actionLink}
						onClick={() => setDismissedNoticeId(notification.id)}
					>
						{notification.actionLabel} <span aria-hidden="true">→</span>
					</Link>
				) : null}
			</div>
			<button
				type="button"
				className={styles.closeButton}
				aria-label="Cerrar notificación"
				onClick={() => setDismissedNoticeId(notification.id)}
			>
				<span aria-hidden="true">×</span>
			</button>
		</aside>
	)
}

export default ActionToast
