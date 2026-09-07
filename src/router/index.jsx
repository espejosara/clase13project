import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import PrivateRoute from '../components/PrivateRoute/PrivateRoute'
import AdminRoute from '../components/AdminRoute/AdminRoute'
import {
	AdminPage,
	AdminProductFormPage,
	AdminProductsPage,
	CartPage,
	CheckoutPage,
	CheckoutSuccessPage,
	HomePage,
	LoginPage,
	NotFoundPage,
	ProductDetailPage,
	ProductsPage,
	ProfilePage,
	RegisterPage,
	WishlistPage,
} from './lazyPages'

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
				element: <AdminRoute />,
				children: [
					{
						path: 'admin',
						element: <AdminPage />,
					},
					{
						path: 'admin/products',
						element: <AdminProductsPage />,
					},
					{
						path: 'admin/products/new',
						element: <AdminProductFormPage />,
					},
					{
						path: 'admin/products/:id/edit',
						element: <AdminProductFormPage />,
					},
				],
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
