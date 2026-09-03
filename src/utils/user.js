export function getInitials(name, fallback = 'U') {
	if (!name) return fallback

	const initials = String(name)
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('')

	return initials || fallback
}
