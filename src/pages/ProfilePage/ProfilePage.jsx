import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Spinner from '../../components/Spinner/Spinner'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { fetchCurrentUserThunk, logoutThunk } from '../../store/slices/authSlice'
import { fetchOrdersThunk } from '../../store/slices/ordersSlice'
import { formatOrderItemSummary } from '../../utils/orderSummary'
import styles from './ProfilePage.module.css'

const FALLBACK_PRODUCT_IMAGE =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="%23f8fafc"/><text x="50%25" y="54%25" text-anchor="middle" font-size="11" fill="%2364748b" font-family="Arial">Sin imagen</text></svg>'

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

function formatOrderDate(value) {
	if (!value) return 'Sin fecha'

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value

	return new Intl.DateTimeFormat('es-ES', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
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
	if (!item || typeof item === 'string') return FALLBACK_PRODUCT_IMAGE
	return item.imageUrl
		|| item.product?.imageUrl
		|| item.productDetails?.imageUrl
		|| FALLBACK_PRODUCT_IMAGE
}

function getOrderStatus(order) {
	return order.status || (order.paidAt ? 'Pagado' : 'Pedido registrado')
}

function getOrderStatusClass(status) {
	const normalizedStatus = String(status).toLowerCase()

	if (/pagad|complet|confirm/.test(normalizedStatus)) {
		return styles.orderStatusSuccess
	}

	if (/cancel|fall|rechaz/.test(normalizedStatus)) {
		return styles.orderStatusDanger
	}

	if (/pend|proces/.test(normalizedStatus)) {
		return styles.orderStatusWarning
	}

	return styles.orderStatusNeutral
}

function getOrderDetailsId(orderId) {
	return `order-${String(orderId).replace(/[^a-zA-Z0-9_-]/g, '-')}-details`
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

	const handleLogout = async () => {
		try {
			await dispatch(logoutThunk()).unwrap()
			navigate('/login')
		} catch {
			// El error ya queda reflejado en auth.error.
		}
	}

	const userName = user?.name || 'Usuario sin nombre'
	const userRole = user?.role || 'user'
	const memberSince = user?.memberSince || user?.createdAt
	const wishlistCount = user?.wishlistCount ?? user?.wishlist?.count ?? 0
	const checkoutOrdersCount = user?.checkoutOrdersCount ?? user?.checkout?.ordersCount ?? 0
	const lastOrder = user?.lastOrder ?? user?.checkout?.lastOrder ?? null

	return (
		<section className={styles.page} aria-labelledby="profile-title">
			<header className={styles.header}>
				<p className={styles.eyebrow}>Mi cuenta</p>
				<h1 id="profile-title" className={styles.title}>Perfil</h1>
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
					<div className={styles.sectionHeader}>
						<h2 className={styles.sectionTitle}>Historial de pedidos</h2>
						{!loading && !error && orders.length ? (
							<p className={styles.orderCount}>
								{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
							</p>
						) : null}
					</div>

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
								const status = getOrderStatus(order)
								const statusClass = getOrderStatusClass(status)
								const items = getOrderProducts(order)
								const itemSummary = formatOrderItemSummary(items)
								const isOpen = openOrderId === String(orderId)
								const detailsId = getOrderDetailsId(orderId)

								return (
									<li key={String(orderId)} className={styles.orderCard}>
										<div className={styles.orderHeader}>
											<div>
												<p className={styles.orderId}>Pedido #{String(orderId)}</p>
												<p className={styles.orderDate}>{formatOrderDate(date)}</p>
											</div>
											<span className={`${styles.orderStatus} ${statusClass}`}>{status}</span>
										</div>

										<div className={styles.orderMeta}>
											<div className={styles.metaItem}>
												<span className={styles.metaItemLabel}>Contenido</span>
												<p className={styles.metaItemValue}>{itemSummary}</p>
											</div>
											<div className={`${styles.metaItem} ${styles.totalItem}`}>
												<span className={styles.metaItemLabel}>Total del pedido</span>
												<p className={styles.totalValue}>{formatPrice(total)}</p>
											</div>
										</div>

										<button
											type="button"
											className={styles.toggleButton}
											onClick={() => toggleOrder(String(orderId))}
											aria-expanded={isOpen}
											aria-controls={detailsId}
										>
											<span>{isOpen ? 'Ocultar detalle' : 'Ver detalle'}</span>
											<span aria-hidden="true">{isOpen ? '−' : '+'}</span>
										</button>

										{isOpen ? (
											<div id={detailsId} className={styles.itemsSection}>
												<span className={styles.metaItemLabel}>Artículos comprados</span>
												<ul className={styles.itemsList}>
													{items.length ? (
														items.map((item, index) => {
															const quantity = Number(item?.quantity ?? item?.qty ?? 1)
															const unitPrice = Number(item?.unitPrice ?? item?.price ?? 0)
																	const subtotal = Number(item?.subtotal ?? item?.total ?? quantity * unitPrice)
																	const itemName = item?.name || item?.productName || `Producto ${item?.productId ?? item?.id ?? index + 1}`
																	const imageUrl = getOrderProductImage(item)
																	const productId = item?.productId ?? item?.product?.id
																	const quantityLabel = `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}`

															return (
																		<li key={`${String(orderId)}-${item?.productId ?? item?.id ?? index}`} className={styles.productItem}>
																			<img src={imageUrl} alt={itemName} className={styles.productThumb} />
																			<div className={styles.productMeta}>
																				<div className={styles.productHeading}>
																					<p className={styles.productName}>{itemName}</p>
																					<span className={styles.quantityBadge}>{quantityLabel}</span>
																				</div>
																				{productId != null ? (
																					<p className={styles.productReference}>Referencia #{productId}</p>
																				) : null}
																			</div>
																			<div className={styles.productPricing}>
																				<div>
																					<span className={styles.priceLabel}>Precio unitario</span>
																					<p className={styles.priceValue}>{formatPrice(unitPrice)}</p>
																				</div>
																				<div>
																					<span className={styles.priceLabel}>Subtotal</span>
																					<p className={`${styles.priceValue} ${styles.subtotalValue}`}>{formatPrice(subtotal)}</p>
																				</div>
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
		</section>
	)
}

export default ProfilePage
