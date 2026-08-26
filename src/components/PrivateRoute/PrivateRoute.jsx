import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PrivateRoute({ children, allowedRoles }) {
	const token = useSelector((state) => state.auth.token)
	const user = useSelector((state) => state.auth.user)
	const location = useLocation()

	if (!token) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}

	if (allowedRoles?.length) {
		const userRole = String(user?.role || 'user').toLowerCase()
		const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toLowerCase())
		const isAllowed = normalizedAllowedRoles.includes(userRole)

		if (!isAllowed) {
			return <Navigate to="/profile" replace />
		}
	}

	return children
}

export default PrivateRoute
