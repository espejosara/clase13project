import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../Button/Button'
import { fetchCartThunk } from '../../store/slices/cartSlice'
import { logout } from '../../store/slices/authSlice'
import { clearWishlist, setLocalWishlist } from '../../store/slices/wishlistSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { fetchWishlistRequest } from '../../api/wishlist'
import './Header.css'

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const profileMenuRef = useRef(null)
	const token = useSelector((state) => state.auth.token)
	const user = useSelector((state) => state.auth.user)
	const cartItems = useSelector((state) => state.cart.items)
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const location = useLocation()
	const isAuthenticated = Boolean(token)

	const getNavLinkClass = ({ isActive }) =>
		isActive ? 'header__link header__link--active' : 'header__link'
	const getIconLinkClass = ({ isActive }) =>
		isActive ? 'header__icon-link header__icon-link--active' : 'header__icon-link'

	const cartCount = useMemo(
		() =>
			cartItems.reduce((total, item) => {
				const quantity = Number(item?.quantity ?? 1)
				return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
			}, 0),
		[cartItems],
	)

	const wishlistCount = useMemo(() => {
		if (wishlistIds.length) return wishlistIds.length
		const fallbackCount = Number(user?.wishlistCount ?? user?.wishlist?.count ?? 0)
		return Number.isFinite(fallbackCount) ? fallbackCount : 0
	}, [user?.wishlist?.count, user?.wishlistCount, wishlistIds])

	useEffect(() => {
		setIsMenuOpen(false)
		setIsProfileMenuOpen(false)
	}, [location.pathname])

	useEffect(() => {
		if (!isAuthenticated) {
			dispatch(clearCart())
			dispatch(clearWishlist())
			return
		}

		dispatch(fetchCartThunk())

		const syncWishlist = async () => {
			try {
				const data = await fetchWishlistRequest()
				dispatch(setLocalWishlist(data))
			} catch {
				// Evita bloquear la cabecera cuando falla la sincronización inicial.
			}
		}

		syncWishlist()
	}, [dispatch, isAuthenticated])

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
		<header className="header">
			<div className="header__top">
				<Link to="/" className="header__brand" aria-label="Ir al inicio">
					<p className="header__eyebrow">Tienda oficial</p>
					<h1 className="header__title">NeoKensei Chronicles</h1>
				</Link>

				<Button
					type="button"
					variant="outline"
					className={`header__menu-button ${isMenuOpen ? 'is-open' : ''}`}
					onClick={handleToggleMenu}
					aria-expanded={isMenuOpen}
					aria-controls="main-navigation"
					aria-label={isMenuOpen ? 'Cerrar menu de navegacion' : 'Abrir menu de navegacion'}
				>
					<span className="header__menu-line" />
					<span className="header__menu-line" />
					<span className="header__menu-line" />
				</Button>
			</div>

			<nav
				id="main-navigation"
				className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}
				aria-label="Navegacion principal"
			>
				<div className="header__nav-left">
					<NavLink to="/products" className={getNavLinkClass}>
						Catalogo
					</NavLink>
				</div>

				<div className="header__nav-right">
					{isAuthenticated ? (
						<>
							<NavLink to="/wishlist" className={getIconLinkClass} aria-label="Favoritos">
								<span className="header__icon" aria-hidden="true">❤</span>
								<span className="header__icon-label">Favoritos</span>
								<span className="header__badge" aria-label={`${wishlistCount} productos en favoritos`}>
									{wishlistCount}
								</span>
							</NavLink>

							<NavLink to="/cart" className={getIconLinkClass} aria-label="Carrito">
								<span className="header__icon" aria-hidden="true">🛒</span>
								<span className="header__icon-label">Carrito</span>
								<span className="header__badge" aria-label={`${cartCount} unidades en carrito`}>
									{cartCount}
								</span>
							</NavLink>

						<div className="header__profile" ref={profileMenuRef}>
							<Button
								type="button"
								variant="outline"
								className={`header__profile-button ${isProfileMenuOpen ? 'is-open' : ''}`}
								onClick={handleToggleProfileMenu}
								aria-haspopup="menu"
								aria-expanded={isProfileMenuOpen}
							>
								<span className="header__icon" aria-hidden="true">👤</span>
								<span className="header__icon-label">Perfil</span>
							</Button>

							{isProfileMenuOpen ? (
								<div className="header__dropdown" role="menu" aria-label="Menu de usuario">
									<Link to="/profile" className="header__dropdown-item" role="menuitem">
										Mi cuenta
									</Link>
									{user?.role === 'admin' ? (
										<Link to="/admin" className="header__dropdown-item" role="menuitem">
											Panel admin
										</Link>
									) : null}
									<button
										type="button"
										className="header__dropdown-item header__dropdown-item--danger"
										onClick={handleLogout}
										role="menuitem"
									>
										Cerrar sesion
									</button>
								</div>
							) : null}
						</div>
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