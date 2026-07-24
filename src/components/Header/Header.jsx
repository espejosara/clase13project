import { NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
	return (
		<header className="header">
			<div className="header__brand">
				<p className="header__eyebrow">Tienda oficial</p>
				<h1 className="header__title">Anime Figures</h1>
			</div>

			<nav className="header__nav" aria-label="Navegacion principal">
				<NavLink
					to="/"
					className={({ isActive }) =>
						isActive ? 'header__link header__link--active' : 'header__link'
					}
				>
					Tienda
				</NavLink>
				<NavLink
					to="/products"
					className={({ isActive }) =>
						isActive ? 'header__link header__link--active' : 'header__link'
					}
				>
					Catalogo
				</NavLink>
			</nav>
		</header>
	)
}

export default Header