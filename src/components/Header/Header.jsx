import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './Header.css'

function Header() {
	const user = useSelector((state) => state.auth.user)
	const getNavLinkClass = ({ isActive }) =>
		isActive ? 'header__link header__link--active' : 'header__link'

	return (
		<header className="header">
			<div className="header__brand">
				<p className="header__eyebrow">Universo oficial</p>
				<h1 className="header__title">NeoKensei Chronicles</h1>
			</div>

			<nav className="header__nav" aria-label="Navegacion principal">
				<NavLink to="/" className={getNavLinkClass}>
					Tienda
				</NavLink>
				<NavLink to="/products" className={getNavLinkClass}>
					Catálogo
				</NavLink>
				<NavLink to="/login" className={getNavLinkClass}>
					Iniciar sesión
				</NavLink>
				<NavLink to="/register" className={getNavLinkClass}>
					Registro
				</NavLink>
				<NavLink to="/cart" className={getNavLinkClass}>
					Carrito
				</NavLink>
				<NavLink to="/wishlist" className={getNavLinkClass}>
					Favoritos
				</NavLink>
				<NavLink to="/profile" className={getNavLinkClass}>
					Perfil
				</NavLink>
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