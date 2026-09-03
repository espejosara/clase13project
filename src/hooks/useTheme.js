import { useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'neokensei-theme'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'

function isTheme(value) {
	return value === LIGHT_THEME || value === DARK_THEME
}

function getStoredTheme() {
	try {
		const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
		return isTheme(storedTheme) ? storedTheme : null
	} catch {
		return null
	}
}

function getSystemTheme() {
	if (typeof window.matchMedia !== 'function') return LIGHT_THEME
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME
}

function getInitialTheme() {
	const documentTheme = document.documentElement.dataset.theme
	return isTheme(documentTheme) ? documentTheme : getStoredTheme() || getSystemTheme()
}

function applyTheme(theme) {
	document.documentElement.dataset.theme = theme
	document.documentElement.style.colorScheme = theme
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute('content', theme === DARK_THEME ? '#090f1f' : '#f1f5f9')
}

function useTheme() {
	const [theme, setTheme] = useState(getInitialTheme)

	useEffect(() => {
		applyTheme(theme)
	}, [theme])

	useEffect(() => {
		if (typeof window.matchMedia !== 'function') return undefined

		const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleSystemThemeChange = (event) => {
			if (!getStoredTheme()) {
				setTheme(event.matches ? DARK_THEME : LIGHT_THEME)
			}
		}

		colorSchemeQuery.addEventListener?.('change', handleSystemThemeChange)

		return () => {
			colorSchemeQuery.removeEventListener?.('change', handleSystemThemeChange)
		}
	}, [])

	const toggleTheme = () => {
		setTheme((currentTheme) => {
			const nextTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME

			try {
				window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
			} catch {
				// El tema sigue funcionando durante la sesión si el almacenamiento no está disponible.
			}

			return nextTheme
		})
	}

	return { theme, toggleTheme }
}

export default useTheme
