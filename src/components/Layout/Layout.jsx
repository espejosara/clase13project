import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import ActionToast from '../ActionToast/ActionToast'
import MobileBottomNav from '../MobileBottomNav/MobileBottomNav'
import styles from './Layout.module.css'

function Layout() {
	const location = useLocation()
	const mainContentRef = useRef(null)
	const isInitialRender = useRef(true)

	useEffect(() => {
		if (isInitialRender.current) {
			isInitialRender.current = false
			return
		}

		mainContentRef.current?.focus()
	}, [location.pathname])

	return (
		<div className={styles.layout}>
			<Header />
			<ActionToast />
			<MobileBottomNav />
			<main id="main-content" ref={mainContentRef} tabIndex="-1" className={styles.main}>
				<Outlet />
			</main>
			<Footer />
		</div>
	)
}

export default Layout
