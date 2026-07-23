import { createBrowserRouter } from 'react-router-dom'

function RootPlaceholder() {
	return (
		<main>
			<h1>Sprint 1</h1>
			<p>Router preparado. El siguiente paso sera montar Layout y paginas.</p>
		</main>
	)
}

export const router = createBrowserRouter([
	{
		path: '/',
		element: <RootPlaceholder />,
	},
])
