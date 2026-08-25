import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../Button/Button'
import { fetchCartThunk } from '../../store/slices/cartSlice'
import { logout } from '../../store/slices/authSlice'
import { clearWishlist, setLocalWishlist } from '../../store/slices/wishlistSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { fetchWishlistRequest } from '../../api/wishlist'
import styles from './Header.module.css'

const HEADER_SYNC_TTL_MS = 12000

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const profileMenuRef = useRef(null)
	const lastHeaderSyncRef = useRef(0)
	const token = useSelector((state) => state.auth.token)
	const user = useSelector((state) => state.auth.user)
	const cartItems = useSelector((state) => state.cart.items)
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const location = useLocation()
	const isAuthenticated = Boolean(token)

	const getNavLinkClass = ({ isActive }) =>
		isActive ? `${styles.link} ${styles.linkActive}` : styles.link
	const getIconLinkClass = ({ isActive }) =>
		isActive ? `${styles.iconLink} ${styles.iconLinkActive}` : styles.iconLink

	const cartCount = useMemo(
		() =>
			cartItems.reduce((total, item) => {
				const quantity = Number(item?.quantity ?? 1)
				return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
			}, 0),
		[cartItems],
	)

	const wishlistCount = wishlistIds.length

	useEffect(() => {
		if (!import.meta.env.DEV) return

		console.log('[Header badges]', {
			path: location.pathname,
			cartCount,
			wishlistCount,
			cartItems,
			wishlistIds,
		})
	}, [cartCount, wishlistCount, cartItems, wishlistIds, location.pathname])

	useEffect(() => {
		setIsMenuOpen(false)
		setIsProfileMenuOpen(false)
	}, [location.pathname])

	useEffect(() => {
		if (!isAuthenticated) {
			dispatch(clearCart())
			dispatch(clearWishlist())
			lastHeaderSyncRef.current = 0
			return
		}

		let isActive = true

		const syncHeaderCounters = async (force = false) => {
			const now = Date.now()
			const isFresh = now - lastHeaderSyncRef.current < HEADER_SYNC_TTL_MS

			if (!force && isFresh) {
				return
			}

			dispatch(fetchCartThunk())

			try {
				const data = await fetchWishlistRequest()

				if (isActive) {
					dispatch(setLocalWishlist(data))
				}
			} catch {
				// Evita bloquear la cabecera cuando falla la sincronización inicial.
			} finally {
				if (isActive) {
					lastHeaderSyncRef.current = now
				}
			}
		}

		syncHeaderCounters()

		return () => {
			isActive = false
		}
	}, [dispatch, isAuthenticated, location.pathname])

	useEffect(() => {
		if (!isProfileMenuOpen) return undefined

		const handleOutsideClick = (event) => {
			if (!profileMenuRef.current?.contains(event.target)) {
				setIsProfileMenuOpen(false)
			}
		}

		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				setIsProfileMenuOpen(false)
			}
		}

		document.addEventListener('mousedown', handleOutsideClick)
		document.addEventListener('keydown', handleEscape)

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick)
			document.removeEventListener('keydown', handleEscape)
		}
	}, [isProfileMenuOpen])

	const handleToggleMenu = () => {
		setIsMenuOpen((previousState) => !previousState)
	}

	const handleToggleProfileMenu = () => {
		setIsProfileMenuOpen((previousState) => !previousState)
	}

	const handleLogout = () => {
		dispatch(logout())
		dispatch(clearCart())
		dispatch(clearWishlist())
		setIsProfileMenuOpen(false)
		navigate('/login')
	}

	return (
		<header className={styles.header}>
			<div className={styles.top}>
				<Link to="/" className={styles.brand} aria-label="Ir al inicio">
					<p className={styles.eyebrow}>Tienda oficial</p>
					<h1 className={styles.title}>NeoKensei Chronicles</h1>
				</Link>

				<Button
					type="button"
					variant="outline"
					className={`${styles.menuButton} ${isMenuOpen ? styles.isOpen : ''}`}
					onClick={handleToggleMenu}
					aria-expanded={isMenuOpen}
					aria-controls="main-navigation"
					aria-label={isMenuOpen ? 'Cerrar menu de navegacion' : 'Abrir menu de navegacion'}
				>
					<span className={styles.menuLine} />
					<span className={styles.menuLine} />
					<span className={styles.menuLine} />
				</Button>
			</div>

			<nav
				id="main-navigation"
				className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
				aria-label="Navegacion principal"
			>
				<div className={styles.navLeft}>
					<NavLink to="/products" className={getNavLinkClass}>
						Catalogo
					</NavLink>
				</div>

				<div className={styles.navRight}>
					{isAuthenticated ? (
						<>
							<div className={styles.profile} ref={profileMenuRef}>
								<Button
									type="button"
									variant="outline"
									className={`${styles.profileButton} ${styles.iconOnly} ${isProfileMenuOpen ? styles.isOpen : ''}`}
									onClick={handleToggleProfileMenu}
									aria-haspopup="menu"
									aria-expanded={isProfileMenuOpen}
									aria-label="Usuario"
									data-label="Usuario"
								>
									<span className={styles.icon} aria-hidden="true">👤</span>
									<span className={styles.srOnly}>Usuario</span>
								</Button>

								{isProfileMenuOpen ? (
									<div className={styles.dropdown} role="menu" aria-label="Menu de usuario">
										<Link to="/profile" className={styles.dropdownItem} role="menuitem">
											Mi cuenta
										</Link>
										{user?.role === 'admin' ? (
											<Link to="/admin" className={styles.dropdownItem} role="menuitem">
												Panel admin
											</Link>
										) : null}
										<button
											type="button"
											className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
											onClick={handleLogout}
											role="menuitem"
										>
											Cerrar sesion
										</button>
									</div>
								) : null}
							</div>

							<NavLink
								to="/wishlist"
								className={({ isActive }) => `${getIconLinkClass({ isActive })} ${styles.iconOnly}`}
								aria-label="Favoritos"
								data-label="Favoritos"
							>
								<span className={styles.icon} aria-hidden="true">❤</span>
								<span className={styles.srOnly}>Favoritos</span>
								<span className={styles.badge} aria-label={`${wishlistCount} productos en favoritos`}>
									{wishlistCount}
								</span>
							</NavLink>

							<NavLink
								to="/cart"
								className={({ isActive }) => `${getIconLinkClass({ isActive })} ${styles.iconOnly}`}
								aria-label="Carrito"
								data-label="Carrito"
							>
								<span className={styles.icon} aria-hidden="true">🛒</span>
								<span className={styles.srOnly}>Carrito</span>
								<span className={styles.badge} aria-label={`${cartCount} unidades en carrito`}>
									{cartCount}
								</span>
							</NavLink>
						</>
					) : (
						<>
							<NavLink to="/login" className={getNavLinkClass}>
								Entrar
							</NavLink>
							<NavLink to="/register" className={getNavLinkClass}>
								Registrarse
							</NavLink>
						</>
					)}
				</div>
			</nav>
		</header>
	)
}

export default Header