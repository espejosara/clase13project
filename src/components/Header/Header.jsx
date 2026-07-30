import { NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
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
					Catalogo
				</NavLink>
				<NavLink to="/login" className={getNavLinkClass}>
					Login
				</NavLink>
				<NavLink to="/register" className={getNavLinkClass}>
					Registro
				</NavLink>
			</nav>
		</header>
	)
}

export default Header