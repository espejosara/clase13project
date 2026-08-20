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
		const userRole = user?.role || 'user'
		const isAllowed = allowedRoles.includes(userRole)

		if (!isAllowed) {
			return <Navigate to="/profile" replace />
		}
	}

	return children
}

export default PrivateRoute