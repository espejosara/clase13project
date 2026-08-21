import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Button from '../Button/Button'
import './Header.css'

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const token = useSelector((state) => state.auth.token)
	const user = useSelector((state) => state.auth.user)
	const location = useLocation()
	const getNavLinkClass = ({ isActive }) =>
		isActive ? 'header__link header__link--active' : 'header__link'

	useEffect(() => {
		setIsMenuOpen(false)
	}, [location.pathname])

	const handleToggleMenu = () => {
		setIsMenuOpen((previousState) => !previousState)
	}

	return (
		<header className="header">
			<div className="header__top">
				<div className="header__brand">
					<p className="header__eyebrow">Tienda oficial</p>
					<h1 className="header__title">NeoKensei Chronicles</h1>
				</div>

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
				<NavLink to="/" className={getNavLinkClass}>
					Tienda
				</NavLink>
				<NavLink to="/products" className={getNavLinkClass}>
					Catálogo
				</NavLink>
				{token ? (
					<>
						<NavLink to="/cart" className={getNavLinkClass}>
							Carrito
						</NavLink>
						<NavLink to="/checkout" className={getNavLinkClass}>
							Checkout
						</NavLink>
						<NavLink to="/wishlist" className={getNavLinkClass}>
							Favoritos
						</NavLink>
						<NavLink to="/profile" className={getNavLinkClass}>
							Perfil
						</NavLink>
					</>
				) : (
					<>
						<NavLink to="/login" className={getNavLinkClass}>
							Iniciar sesión
						</NavLink>
						<NavLink to="/register" className={getNavLinkClass}>
							Registro
						</NavLink>
					</>
				)}
				{user?.role === 'admin' ? (
					<NavLink to="/admin" className={getNavLinkClass}>
						Admin
					</NavLink>
				) : null}
			</nav>
		</header>
	)
}

export default Header