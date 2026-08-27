import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectIsAdmin } from '../../store/slices/authSlice'

function AdminRoute() {
	const isAdmin = useSelector(selectIsAdmin)
	const location = useLocation()

	if (!isAdmin) {
		return <Navigate to="/" replace state={{ from: location }} />
	}

	return <Outlet />
}

export default AdminRoute
