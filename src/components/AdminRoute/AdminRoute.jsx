import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectIsAdmin } from '../../store/slices/authSlice'
import Spinner from '../Spinner/Spinner'

function AdminRoute() {
	const isAdmin = useSelector(selectIsAdmin)
	const sessionChecked = useSelector((state) => state.auth.sessionChecked)
	const location = useLocation()

	if (!sessionChecked) {
		return <Spinner label="Comprobando sesión..." />
	}

	if (!isAdmin) {
		return <Navigate to="/" replace state={{ from: location }} />
	}

	return <Outlet />
}

export default AdminRoute
