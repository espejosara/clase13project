import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Spinner from '../../components/Spinner/Spinner'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { fetchCurrentUserThunk, logout } from '../../store/slices/authSlice'
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

function getOrderProducts(order) {
	if (Array.isArray(order?.products)) return order.products
	if (Array.isArray(order?.items)) return order.items
	return []
}

function getOrderProductImage(item) {
	if (!item || typeof item === 'string') return null
	return item.imageUrl || item.product?.imageUrl || item.productDetails?.imageUrl || null
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
	const [openOrderId, setOpenOrderId] = useState(null)

	useEffect(() => {
		dispatch(fetchCurrentUserThunk())
		dispatch(fetchOrdersThunk())
	}, [dispatch])

	const toggleOrder = (orderId) => {
		setOpenOrderId((current) => (current === orderId ? null : orderId))
	}

	const handleLogout = () => {
		dispatch(logout())
		navigate('/login')
	}

	const userName = user?.name || 'Usuario sin nombre'
	const userRole = user?.role || 'user'
	const memberSince = user?.memberSince || user?.createdAt
	const wishlistCount = user?.wishlistCount ?? user?.wishlist?.count ?? 0
	const checkoutOrdersCount = user?.checkoutOrdersCount ?? user?.checkout?.ordersCount ?? 0
	const lastOrder = user?.lastOrder ?? user?.checkout?.lastOrder ?? null

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<p className={styles.eyebrow}>Mi cuenta</p>
				<h1 className={styles.title}>Perfil</h1>
				<p className={styles.subtitle}>Gestiona tu cuenta y revisa tu historial de compras.</p>
			</header>

			<div className={styles.layout}>
				<section id="perfil-general" className={`${styles.card} ${styles.userCard}`}>
					<div className={styles.avatarWrap}>{getInitials(userName)}</div>
					<h2 className={styles.userName}>{userName}</h2>
					<span className={styles.userRole}>{userRole}</span>

					<div className={styles.infoGrid}>
						<div className={styles.infoItem}>
							<span className={styles.label}>Email</span>
							<p className={styles.value}>{user?.email || 'Sin email'}</p>
						</div>
						{user?.phone ? (
							<div className={styles.infoItem}>
								<span className={styles.label}>Teléfono</span>
								<p className={styles.value}>{user.phone}</p>
							</div>
						) : null}
						{user?.address ? (
							<div className={styles.infoItem}>
								<span className={styles.label}>Dirección</span>
								<p className={styles.value}>{user.address}</p>
							</div>
						) : null}
						<div className={styles.infoItem}>
							<span className={styles.label}>Miembro desde</span>
							<p className={styles.value}>{formatDate(memberSince)}</p>
						</div>
					</div>

					<div className={styles.infoGrid}>
						<div className={styles.infoItem}>
							<span className={styles.label}>Favoritos</span>
							<p className={styles.value}>{wishlistCount}</p>
						</div>
						<div className={styles.infoItem}>
							<span className={styles.label}>Pedidos</span>
							<p className={styles.value}>{checkoutOrdersCount}</p>
						</div>
						<div className={styles.infoItem}>
							<span className={styles.label}>Última compra</span>
							<p className={styles.value}>{lastOrder ? formatDate(lastOrder.createdAt ?? lastOrder.date) : 'Sin compras aún'}</p>
						</div>
					</div>
				</section>

				<section id="historial-pedidos" className={`${styles.card} ${styles.ordersCard}`}>
					<h2 className={styles.sectionTitle}>Historial de pedidos</h2>

					{loading ? (
						<Spinner label="Cargando pedidos..." />
					) : error ? (
						<StatusMessage title="Pedidos" description={error} variant="warning" />
					) : orders.length ? (
						<ul className={styles.ordersList}>
							{orders.map((order) => {
								const orderId = order.id ?? order._id ?? order.orderId ?? 'pedido'
								const total = Number(order.total ?? order.amount ?? order.totalPrice ?? 0)
								const date = order.createdAt ?? order.date ?? order.updatedAt
								const status = order.status || 'Procesado'
								const items = getOrderProducts(order)
								const isOpen = openOrderId === String(orderId)

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

										<button
											type="button"
											className={styles.toggleButton}
											onClick={() => toggleOrder(String(orderId))}
										>
											<span>{isOpen ? 'Ocultar detalle' : 'Ver detalle'}</span>
											<span aria-hidden="true">{isOpen ? '−' : '+'}</span>
										</button>

										{isOpen ? (
											<div className={styles.itemsSection}>
												<span className={styles.metaItemLabel}>Artículos comprados</span>
												<ul className={styles.itemsList}>
													{items.length ? (
														items.map((item, index) => {
															const quantity = Number(item?.quantity ?? item?.qty ?? 1)
															const unitPrice = Number(item?.unitPrice ?? item?.price ?? 0)
															const subtotal = Number(item?.subtotal ?? item?.total ?? quantity * unitPrice)
															const itemName = item?.name || item?.productName || `Producto ${item?.productId ?? item?.id ?? index + 1}`
															const imageUrl = getOrderProductImage(item)

															return (
																<li key={`${String(orderId)}-${item?.productId ?? item?.id ?? index}`} className={styles.productItem}>
																	{imageUrl ? (
																		<img src={imageUrl} alt={itemName} className={styles.productThumb} />
																	) : null}
																	<div className={styles.productMeta}>
																		<p className={styles.productName}>{itemName}</p>
																		<p className={styles.productDetails}>Cantidad: {quantity}</p>
																		<p className={styles.productDetails}>Precio unitario: {formatPrice(unitPrice)}</p>
																		<p className={styles.productDetails}>Subtotal: {formatPrice(subtotal)}</p>
																	</div>
																</li>
															)
														})
													) : (
														<li className={styles.itemRow}>Sin productos registrados</li>
													)}
												</ul>
											</div>
										) : null}
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