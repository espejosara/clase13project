import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Spinner from '../../components/Spinner/Spinner'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { logout } from '../../store/slices/authSlice'
import { fetchOrdersThunk } from '../../store/slices/ordersSlice'
import styles from './ProfilePage.module.css'

function formatDate(value) {
	if (!value) return 'Sin fecha'

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value

	return new Intl.DateTimeFormat('es-ES', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}).format(date)
}

function formatPrice(value) {
	const numericValue = Number(value ?? 0)
	if (Number.isNaN(numericValue)) return '€0'
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: 'EUR',
	}).format(numericValue)
}

function getInitials(name) {
	if (!name) return 'U'
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('')
}

function ProfilePage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { user } = useSelector((state) => state.auth)
	const { items: orders, loading, error } = useSelector((state) => state.orders)

	useEffect(() => {
		dispatch(fetchOrdersThunk())
	}, [dispatch])

	const handleLogout = () => {
		dispatch(logout())
		navigate('/login')
	}

	const userName = user?.name || 'Usuario sin nombre'
	const userRole = user?.role || 'user'

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<p className={styles.eyebrow}>Mi cuenta</p>
				<h1 className={styles.title}>Perfil</h1>
				<p className={styles.subtitle}>Gestiona tu cuenta y revisa tu historial de compras.</p>
			</header>

			<div className={styles.layout}>
				<section className={`${styles.card} ${styles.userCard}`}>
					<div className={styles.avatarWrap}>{getInitials(userName)}</div>
					<h2 className={styles.userName}>{userName}</h2>
					<span className={styles.userRole}>{userRole}</span>

					<div className={styles.infoGrid}>
						<div className={styles.infoItem}>
							<span className={styles.label}>Email</span>
							<p className={styles.value}>{user?.email || 'Sin email'}</p>
						</div>
						<div className={styles.infoItem}>
							<span className={styles.label}>Teléfono</span>
							<p className={styles.value}>{user?.phone || 'No indicado'}</p>
						</div>
						<div className={styles.infoItem}>
							<span className={styles.label}>Dirección</span>
							<p className={styles.value}>{user?.address || 'No indicada'}</p>
						</div>
						<div className={styles.infoItem}>
							<span className={styles.label}>Miembro desde</span>
							<p className={styles.value}>{formatDate(user?.createdAt)}</p>
						</div>
					</div>
				</section>

				<section className={`${styles.card} ${styles.ordersCard}`}>
					<h2 className={styles.sectionTitle}>Historial de pedidos</h2>

					{loading ? (
						<Spinner label="Cargando pedidos..." />
					) : error ? (
						<StatusMessage title="Pedidos" description={error} variant="warning" />
					) : orders.length ? (
						<ul className={styles.ordersList}>
							{orders.map((order) => {
								const orderId = order.id ?? order._id ?? order.orderId ?? 'pedido'
								const total = order.total ?? order.amount ?? order.totalPrice ?? 0
								const date = order.createdAt ?? order.date ?? order.updatedAt
								const status = order.status || 'Procesado'
								const items = order.items ?? order.products ?? []

								return (
									<li key={String(orderId)} className={styles.orderCard}>
										<div className={styles.orderHeader}>
											<p className={styles.orderId}>Pedido #{String(orderId)}</p>
											<span className={styles.orderStatus}>{status}</span>
										</div>

										<div className={styles.orderMeta}>
											<div className={styles.metaItem}>
												<span className={styles.metaItemLabel}>Fecha</span>
												<p className={styles.metaItemValue}>{formatDate(date)}</p>
											</div>
											<div className={styles.metaItem}>
												<span className={styles.metaItemLabel}>Total</span>
												<p className={styles.metaItemValue}>{formatPrice(total)}</p>
											</div>
											<div className={styles.metaItem}>
												<span className={styles.metaItemLabel}>Productos</span>
												<p className={styles.metaItemValue}>{items.length || 0}</p>
											</div>
										</div>
									</li>
								)
							})}
						</ul>
					) : (
						<div className={styles.emptyState}>Aún no tienes pedidos realizados.</div>
					)}
				</section>
			</div>

			<Button type="button" variant="danger" onClick={handleLogout} className={styles.logoutButton}>
				Cerrar sesión
			</Button>
		</main>
	)
}

export default ProfilePage