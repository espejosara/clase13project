import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

function useRequireAuthentication() {
	const authenticatedUser = useSelector((state) => state.auth.user)
	const location = useLocation()
	const navigate = useNavigate()

	return (intent) => {
		if (authenticatedUser) return true

		navigate('/login', {
			state: { from: location, authIntent: intent },
		})
		return false
	}
}

export default useRequireAuthentication
