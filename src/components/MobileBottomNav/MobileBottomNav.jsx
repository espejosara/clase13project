import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutThunk, selectIsAdmin } from '../../store/slices/authSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { clearWishlist } from '../../store/slices/wishlistSlice'
import useTheme from '../../hooks/useTheme'
import styles from './MobileBottomNav.module.css'

function NavigationIcon({ type }) {
	const paths = {
		home: <path d="M3 10.75 12 3l9 7.75M5.5 9.5V21h13V9.5M9.25 21v-6.5h5.5V21" />,
		catalog: <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />,
		heart: <path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 6l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.3 1-1a5.5 5.5 0 0 0 0-7.8Z" />,
		cart: <><path d="M3 3h1.5l1.8 10.1a2 2 0 0 0 2 1.65h8.85a2 2 0 0 0 1.95-1.55L20.5 7H5.2" /><circle cx="9" cy="19" r="1.25" /><circle cx="17" cy="19" r="1.25" /></>,
		account: <><circle cx="12" cy="8" r="3.25" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
	}

	return (
		<svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
			{paths[type]}
		</svg>
	)
}

function MobileBottomNav() {
	const [isAccountOpen, setIsAccountOpen] = useState(false)
	const accountRef = useRef(null)
	const accountButtonRef = useRef(null)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const authenticatedUser = useSelector((state) => state.auth.user)
	const isAdmin = useSelector(selectIsAdmin)
	const cartItems = useSelector((state) => state.cart.items)
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const { theme, toggleTheme } = useTheme()
	const isAuthenticated = Boolean(authenticatedUser)
	const isDarkTheme = theme === 'dark'
	const isAccountRoute = ['/login', '/register', '/profile', '/admin'].some(
		(path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
	)
	const cartCount = useMemo(() => cartItems.reduce((total, item) => {
		const quantity = Number(item?.quantity ?? 1)
		return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
	}, 0), [cartItems])

	useEffect(() => {
		if (!isAccountOpen) return undefined

		const closeOnOutsideClick = (event) => {
			if (!accountRef.current?.contains(event.target)) {
				setIsAccountOpen(false)
			}
		}
		const closeOnEscape = (event) => {
			if (event.key === 'Escape') {
				setIsAccountOpen(false)
				accountButtonRef.current?.focus()
			}
		}

		document.addEventListener('mousedown', closeOnOutsideClick)
		document.addEventListener('keydown', closeOnEscape)

		return () => {
			document.removeEventListener('mousedown', closeOnOutsideClick)
			document.removeEventListener('keydown', closeOnEscape)
		}
	}, [isAccountOpen])

	const getItemClass = ({ isActive }) => (
		isActive ? `${styles.item} ${styles.itemActive}` : styles.item
	)

	const closeAccountMenu = () => setIsAccountOpen(false)

	const handleLogout = async () => {
		try {
			await dispatch(logoutThunk()).unwrap()
		} catch {
			return
		}

		dispatch(clearCart())
		dispatch(clearWishlist())
		setIsAccountOpen(false)
		navigate('/login')
	}

	return (
		<nav className={styles.bottomNav} aria-label="Navegación móvil">
			<NavLink to="/" end className={getItemClass}>
				<NavigationIcon type="home" />
				<span>Inicio</span>
			</NavLink>
			<NavLink to="/products" className={getItemClass}>
				<NavigationIcon type="catalog" />
				<span>Catálogo</span>
			</NavLink>
			<NavLink
				to="/wishlist"
				className={getItemClass}
				aria-label={`Favoritos, ${wishlistIds.length} productos guardados`}
			>
				<NavigationIcon type="heart" />
				<span>Favoritos</span>
				{wishlistIds.length ? <span className={styles.badge} aria-hidden="true">{wishlistIds.length}</span> : null}
			</NavLink>
			<NavLink
				to="/cart"
				className={getItemClass}
				aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'unidad' : 'unidades'}`}
			>
				<NavigationIcon type="cart" />
				<span>Carrito</span>
				{cartCount ? <span className={styles.badge} aria-hidden="true">{cartCount}</span> : null}
			</NavLink>
			<div ref={accountRef} className={styles.accountSlot}>
				<button
					ref={accountButtonRef}
					type="button"
					className={`${styles.item} ${isAccountRoute || isAccountOpen ? styles.itemActive : ''}`}
					onClick={() => setIsAccountOpen((isOpen) => !isOpen)}
					aria-expanded={isAccountOpen}
					aria-controls="mobile-account-menu"
				>
					<NavigationIcon type="account" />
					<span>Cuenta</span>
				</button>

				{isAccountOpen ? (
					<div id="mobile-account-menu" className={styles.accountMenu} role="group" aria-label="Opciones de cuenta">
						{isAuthenticated ? (
							<>
								<NavLink to="/profile" className={styles.menuItem} onClick={closeAccountMenu}>Mi cuenta</NavLink>
								{isAdmin ? <NavLink to="/admin" className={styles.menuItem} onClick={closeAccountMenu}>Panel admin</NavLink> : null}
							</>
						) : (
							<>
								<NavLink to="/login" className={styles.menuItem} onClick={closeAccountMenu}>Entrar</NavLink>
								<NavLink to="/register" className={`${styles.menuItem} ${styles.menuItemPrimary}`} onClick={closeAccountMenu}>Crear cuenta</NavLink>
							</>
						)}
						<button type="button" className={styles.menuItem} onClick={toggleTheme}>
							Modo {isDarkTheme ? 'claro' : 'oscuro'}
						</button>
						{isAuthenticated ? (
							<button type="button" className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleLogout}>
								Cerrar sesión
							</button>
						) : null}
					</div>
				) : null}
			</div>
			<span className="visually-hidden" role="status" aria-live="polite">
				Modo {isDarkTheme ? 'oscuro' : 'claro'} activado
			</span>
		</nav>
	)
}

export default MobileBottomNav
