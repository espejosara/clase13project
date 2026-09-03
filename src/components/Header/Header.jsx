import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../Button/Button'
import { fetchCartThunk } from '../../store/slices/cartSlice'
import { logoutThunk, selectIsAdmin } from '../../store/slices/authSlice'
import { clearWishlist, setLocalWishlist } from '../../store/slices/wishlistSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { fetchWishlistRequest } from '../../api/wishlist'
import styles from './Header.module.css'

const HEADER_SYNC_TTL_MS = 12000
const BRAND_MARK_URL = 'https://res.cloudinary.com/dm1w4w1o8/image/upload/v1788436986/favicon-32x32_sjpkgu.png'

function Header() {
	const [openMenuPath, setOpenMenuPath] = useState(null)
	const [openProfileMenuPath, setOpenProfileMenuPath] = useState(null)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const profileMenuRef = useRef(null)
	const lastHeaderSyncRef = useRef(0)
	const authenticatedUser = useSelector((state) => state.auth.user)
	const isAdmin = useSelector(selectIsAdmin)
	const cartItems = useSelector((state) => state.cart.items)
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const location = useLocation()
	const isAuthenticated = Boolean(authenticatedUser)
	const isMenuOpen = openMenuPath === location.pathname
	const isProfileMenuOpen = openProfileMenuPath === location.pathname

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
				setOpenProfileMenuPath(null)
			}
		}

		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				setOpenProfileMenuPath(null)
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
		setOpenMenuPath((previousPath) => (
			previousPath === location.pathname ? null : location.pathname
		))
	}

	const handleToggleProfileMenu = () => {
		setOpenProfileMenuPath((previousPath) => (
			previousPath === location.pathname ? null : location.pathname
		))
	}

	const handleLogout = async () => {
		try {
			await dispatch(logoutThunk()).unwrap()
		} catch {
			return
		}

		dispatch(clearCart())
		dispatch(clearWishlist())
		setOpenProfileMenuPath(null)
		navigate('/login')
	}

	return (
		<>
			<a className="skip-link" href="#main-content">Saltar al contenido principal</a>
			<header className={styles.header}>
				<div className={styles.top}>
					<Link to="/" className={styles.brand} aria-label="Ir al inicio">
						<img
							className={styles.brandMark}
							src={BRAND_MARK_URL}
							alt=""
							width="32"
							height="32"
						/>
						<span className={styles.brandCopy}>
							<span className={styles.eyebrow}>Tienda oficial</span>
							<span className={styles.title}>NeoKensei Chronicles</span>
						</span>
					</Link>

				<Button
					type="button"
					variant="outline"
					className={`${styles.menuButton} ${isMenuOpen ? styles.isOpen : ''}`}
					onClick={handleToggleMenu}
					aria-expanded={isMenuOpen}
					aria-controls="main-navigation"
						aria-label={isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
					>
						<span className={styles.menuLine} />
						<span className={styles.menuLine} />
						<span className={styles.menuLine} />
					</Button>
				</div>

			<nav
				id="main-navigation"
				className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
				aria-label="Navegación principal"
			>
				<div className={styles.navLeft}>
					<NavLink to="/products" className={getNavLinkClass}>
						Catálogo
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
									aria-expanded={isProfileMenuOpen}
									aria-controls="profile-menu"
									aria-label="Usuario"
									data-label="Usuario"
								>
									<span className={styles.icon} aria-hidden="true">👤</span>
									<span className={styles.srOnly}>Usuario</span>
								</Button>

								{isProfileMenuOpen ? (
									<div id="profile-menu" className={styles.dropdown} aria-label="Menú de usuario">
										<Link to="/profile" className={styles.dropdownItem}>
											Mi cuenta
										</Link>
										{isAdmin ? (
											<Link to="/admin" className={styles.dropdownItem}>
												Panel admin
											</Link>
										) : null}
										<button
											type="button"
											className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
											onClick={handleLogout}
										>
											Cerrar sesión
										</button>
									</div>
								) : null}
							</div>

							<NavLink
								to="/wishlist"
								className={({ isActive }) => `${getIconLinkClass({ isActive })} ${styles.iconOnly}`}
								aria-label={`Favoritos, ${wishlistCount} productos guardados`}
								data-label="Favoritos"
							>
								<span className={styles.icon} aria-hidden="true">❤</span>
								<span className={styles.srOnly}>Favoritos</span>
								<span className={styles.badge} aria-hidden="true">
									{wishlistCount}
								</span>
							</NavLink>

							<NavLink
								to="/cart"
								className={({ isActive }) => `${getIconLinkClass({ isActive })} ${styles.iconOnly}`}
								aria-label={`Carrito, ${cartCount} unidades`}
								data-label="Carrito"
							>
								<span className={styles.icon} aria-hidden="true">🛒</span>
								<span className={styles.srOnly}>Carrito</span>
								<span className={styles.badge} aria-hidden="true">
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
		</>
	)
}

export default Header
