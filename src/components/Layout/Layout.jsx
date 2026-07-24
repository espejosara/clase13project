import { Outlet } from 'react-router-dom'
import './Layout.css'

function Layout() {
	return (
		<div className="layout">
			<Outlet />
		</div>
	)
}

export default Layout