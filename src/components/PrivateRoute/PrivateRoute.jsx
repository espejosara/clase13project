import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Spinner from '../Spinner/Spinner'

function PrivateRoute({ children, allowedRoles }) {
	const { sessionChecked, user } = useSelector((state) => state.auth)
	const location = useLocation()

	if (!sessionChecked) {
		return <Spinner label="Comprobando sesión..." />
	}

	if (!user) {
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
