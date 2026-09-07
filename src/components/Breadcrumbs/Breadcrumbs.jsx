import { Link } from 'react-router-dom'
import styles from './Breadcrumbs.module.css'

function Breadcrumbs({ items = [] }) {
	if (!items.length) return null

	return (
		<nav className={styles.breadcrumbs} aria-label="Migas de pan">
			<ol className={styles.list}>
				{items.map((item, index) => {
					const isCurrent = index === items.length - 1

					return (
						<li className={styles.item} key={`${item.label}-${index}`}>
							{index > 0 ? <span className={styles.separator} aria-hidden="true">/</span> : null}
							{!isCurrent && item.to ? (
								<Link className={styles.link} to={item.to}>{item.label}</Link>
							) : (
								<span className={styles.current} aria-current="page" title={item.label}>
									{item.label}
								</span>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}

export default Breadcrumbs
