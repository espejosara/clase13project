import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function PrivateRoute({ children }) {
	const token = useSelector((state) => state.auth.token)
	const location = useLocation()

	if (!token) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}

	return children
}

export default PrivateRoute