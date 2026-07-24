import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage/HomePage'
import ProductsPage from '../pages/ProductsPage/ProductsPage'
import ProductDetailPage from '../pages/ProductDetailPage/ProductDetailPage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <HomePage />,
	},
	{
		path: '/products',
		element: <ProductsPage />,
	},
	{
		path: '/products/:productId',
		element: <ProductDetailPage />,
	},
	{
		path: '*',
		element: <NotFoundPage />,
	},
])
