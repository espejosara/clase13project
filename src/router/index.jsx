import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import HomePage from '../pages/HomePage/HomePage'
import ProductsPage from '../pages/ProductsPage/ProductsPage'
import ProductDetailPage from '../pages/ProductDetailPage/ProductDetailPage'
import LoginPage from '../pages/LoginPage/LoginPage'
import RegisterPage from '../pages/RegisterPage/RegisterPage'
import PrivateRoute from '../components/PrivateRoute/PrivateRoute'
import CartPage from '../pages/CartPage/CartPage'
import WishlistPage from '../pages/WishlistPage/WishlistPage'
import ProfilePage from '../pages/ProfilePage/ProfilePage'
import CheckoutPage from '../pages/CheckoutPage/CheckoutPage'
import CheckoutSuccessPage from '../pages/CheckoutSuccessPage/CheckoutSuccessPage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: 'products',
				element: <ProductsPage />,
			},
			{
				path: 'products/:productId',
				element: <ProductDetailPage />,
			},
			{
				path: 'login',
				element: <LoginPage />,
			},
			{
				path: 'register',
				element: <RegisterPage />,
			},
			{
				path: 'cart',
				element: (
					<PrivateRoute>
						<CartPage />
					</PrivateRoute>
				),
			},
			{
				path: 'wishlist',
				element: (
					<PrivateRoute>
						<WishlistPage />
					</PrivateRoute>
				),
			},
			{
				path: 'profile',
				element: (
					<PrivateRoute>
						<ProfilePage />
					</PrivateRoute>
				),
			},
			{
				path: 'checkout',
				element: (
					<PrivateRoute>
						<CheckoutPage />
					</PrivateRoute>
				),
			},
			{
				path: 'checkout/success',
				element: (
					<PrivateRoute>
						<CheckoutSuccessPage />
					</PrivateRoute>
				),
			},
			{
				path: '*',
				element: <NotFoundPage />,
			},
		],
	},
])
