import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner/Spinner'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { fetchCurrentUserThunk } from '../../store/slices/authSlice'
import { fetchOrdersThunk } from '../../store/slices/ordersSlice'
import { formatOrderItemSummary } from '../../utils/orderSummary'
import styles from './ProfilePage.module.css'

const FALLBACK_PRODUCT_IMAGE =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="%23f8fafc"/><text x="50%25" y="54%25" text-anchor="middle" font-size="11" fill="%2364748b" font-family="Arial">Sin imagen</text></svg>'

function formatDate(value) {
	if (!value) return 'No disponible'

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
	if (Number.isNaN(numericValue)) return '0,00 €'

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

	if (/pagad|complet|confirm/.test(normalizedStatus)) return styles.orderStatusSuccess
	if (/cancel|fall|rechaz/.test(normalizedStatus)) return styles.orderStatusDanger
	if (/pend|proces/.test(normalizedStatus)) return styles.orderStatusWarning

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

function getCountLabel(count, singular, plural) {
	return `${count} ${count === 1 ? singular : plural}`
}

function ProfilePage() {
	const dispatch = useDispatch()
	const { user } = useSelector((state) => state.auth)
	const { items: orders, loading, error } = useSelector((state) => state.orders)
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const [ordersOpen, setOrdersOpen] = useState(false)
	const [openOrderId, setOpenOrderId] = useState(null)

	useEffect(() => {
		dispatch(fetchCurrentUserThunk())
		dispatch(fetchOrdersThunk())
	}, [dispatch])

	const toggleOrder = (orderId) => {
		setOpenOrderId((current) => (current === orderId ? null : orderId))
	}

	const userName = user?.name || 'Usuario sin nombre'
	const firstName = userName.split(' ').filter(Boolean)[0] || 'Usuario'
	const memberSince = user?.memberSince || user?.createdAt
	const profileWishlistCount = Number(user?.wishlistCount ?? user?.wishlist?.count ?? 0)
	const profileOrdersCount = Number(user?.checkoutOrdersCount ?? user?.checkout?.ordersCount ?? 0)
	const wishlistCount = wishlistIds.length || profileWishlistCount
	const ordersCount = orders.length || profileOrdersCount
	const lastOrder = user?.lastOrder ?? user?.checkout?.lastOrder ?? null
	const roleLabel = String(user?.role).toUpperCase() === 'ADMIN'
		? 'Cuenta de administrador'
		: 'Cuenta personal'

	return (
		<section className={styles.page} aria-labelledby="profile-title">
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<p className={styles.eyebrow}>Mi cuenta</p>
					<h1 id="profile-title" className={styles.title}>Hola, {firstName}</h1>
					<p className={styles.subtitle}>
						Consulta tus datos, tus pedidos y los productos que has guardado.
					</p>
				</div>

				<div className={styles.identity}>
					<div className={styles.avatarWrap} aria-hidden="true">{getInitials(userName)}</div>
					<div>
						<p className={styles.userName}>{userName}</p>
						<p className={styles.userEmail}>{user?.email || 'Email no disponible'}</p>
						<span className={styles.userRole}>{roleLabel}</span>
					</div>
				</div>
			</header>

			<div className={styles.accountGrid}>
				<section id="perfil-general" className={`${styles.card} ${styles.detailsCard}`}>
					<div className={styles.sectionHeading}>
						<div className={styles.sectionIcon} aria-hidden="true">●</div>
						<div>
							<p className={styles.sectionEyebrow}>Información personal</p>
							<h2 className={styles.sectionTitle}>Datos de la cuenta</h2>
						</div>
					</div>

					<dl className={styles.infoGrid}>
						<div className={styles.infoItem}>
							<dt className={styles.label}>Nombre</dt>
							<dd className={styles.value}>{userName}</dd>
						</div>
						<div className={styles.infoItem}>
							<dt className={styles.label}>Email</dt>
							<dd className={styles.value}>{user?.email || 'No disponible'}</dd>
						</div>
						{user?.phone ? (
							<div className={styles.infoItem}>
								<dt className={styles.label}>Teléfono</dt>
								<dd className={styles.value}>{user.phone}</dd>
							</div>
						) : null}
						{user?.address ? (
							<div className={styles.infoItem}>
								<dt className={styles.label}>Dirección</dt>
								<dd className={styles.value}>{user.address}</dd>
							</div>
						) : null}
						<div className={styles.infoItem}>
							<dt className={styles.label}>Miembro desde</dt>
							<dd className={styles.value}>{formatDate(memberSince)}</dd>
						</div>
						<div className={styles.infoItem}>
							<dt className={styles.label}>Última compra</dt>
							<dd className={styles.value}>
								{lastOrder ? formatDate(lastOrder.createdAt ?? lastOrder.date) : 'Aún no hay compras'}
							</dd>
						</div>
					</dl>
				</section>

				<nav className={styles.shortcuts} aria-label="Accesos de mi cuenta">
					<button
						type="button"
						className={`${styles.shortcut} ${styles.ordersShortcut}`}
						onClick={() => setOrdersOpen((current) => !current)}
						aria-expanded={ordersOpen}
						aria-controls="orders-panel"
					>
						<span className={styles.shortcutIcon} aria-hidden="true">▣</span>
						<span className={styles.shortcutContent}>
							<span className={styles.shortcutTitle}>Mis pedidos</span>
							<span className={styles.shortcutDescription}>
								{loading && !orders.length
									? 'Consultando tu historial…'
									: getCountLabel(ordersCount, 'pedido realizado', 'pedidos realizados')}
							</span>
						</span>
						<span className={styles.shortcutAction} aria-hidden="true">
							{ordersOpen ? 'Ocultar' : 'Ver historial'} <span>→</span>
						</span>
					</button>

					<Link to="/wishlist" className={`${styles.shortcut} ${styles.wishlistShortcut}`}>
						<span className={styles.shortcutIcon} aria-hidden="true">♡</span>
						<span className={styles.shortcutContent}>
							<span className={styles.shortcutTitle}>Mis favoritos</span>
							<span className={styles.shortcutDescription}>
								{getCountLabel(wishlistCount, 'producto guardado', 'productos guardados')}
							</span>
						</span>
						<span className={styles.shortcutAction} aria-hidden="true">
							Ver favoritos <span>→</span>
						</span>
					</Link>
				</nav>
			</div>

			<section id="historial-pedidos" className={`${styles.card} ${styles.ordersCard}`}>
				<button
					type="button"
					className={styles.ordersToggle}
					onClick={() => setOrdersOpen((current) => !current)}
					aria-expanded={ordersOpen}
					aria-controls="orders-panel"
				>
					<span className={styles.ordersToggleCopy}>
						<span className={styles.sectionEyebrow}>Tus compras</span>
						<span className={styles.ordersTitle}>Historial de pedidos</span>
						<span className={styles.ordersSubtitle}>Consulta productos, cantidades y totales.</span>
					</span>
					<span className={styles.ordersToggleMeta}>
						{!loading && !error ? (
							<span className={styles.orderCount}>{getCountLabel(orders.length, 'pedido', 'pedidos')}</span>
						) : null}
						<span className={`${styles.chevron} ${ordersOpen ? styles.chevronOpen : ''}`} aria-hidden="true">⌄</span>
					</span>
				</button>

				{ordersOpen ? (
					<div id="orders-panel" className={styles.ordersPanel}>
						{loading ? (
							<Spinner label="Cargando pedidos..." />
						) : error ? (
							<StatusMessage title="No pudimos cargar tus pedidos" description={error} variant="warning" />
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
												<span>{isOpen ? 'Ocultar productos' : 'Ver productos'}</span>
												<span aria-hidden="true">{isOpen ? '−' : '+'}</span>
											</button>

											{isOpen ? (
												<div id={detailsId} className={styles.itemsSection}>
													<span className={styles.metaItemLabel}>Artículos comprados</span>
													<ul className={styles.itemsList}>
														{items.length ? items.map((item, index) => {
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
														}) : (
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
							<div className={styles.emptyState}>
								<strong>Aún no tienes pedidos</strong>
								<span>Cuando completes una compra, podrás consultar aquí todos sus detalles.</span>
								<Link to="/products" className={styles.emptyLink}>Explorar productos</Link>
							</div>
						)}
					</div>
				) : null}
			</section>
		</section>
	)
}

export default ProfilePage
