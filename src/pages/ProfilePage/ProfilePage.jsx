import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { logout } from '../../store/slices/authSlice'

function ProfilePage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { user } = useSelector((state) => state.auth)

	const handleLogout = () => {
		dispatch(logout())
		navigate('/login')
	}

	return (
		<section>
			<h1>Perfil</h1>
			<p>Gestiona tu sesión y consulta los datos guardados en el estado global.</p>

			{user ? (
				<>
					<p>
						<strong>Nombre:</strong> {user.name || 'Sin nombre'}
					</p>
					<p>
						<strong>Email:</strong> {user.email || 'Sin email'}
					</p>
					<p>
						<strong>Rol:</strong> {user.role || 'user'}
					</p>
				</>
			) : (
				<p>No hay datos de usuario cargados.</p>
			)}

			<Button type="button" variant="danger" onClick={handleLogout}>
				Cerrar sesión
			</Button>
		</section>
	)
}

export default ProfilePage