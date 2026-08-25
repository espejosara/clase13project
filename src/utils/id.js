export function normalizeId(id) {
	if (id === null || id === undefined) return null

	if (typeof id === 'string' && id.trim() === '') return null

	const numericId = Number(id)
	return Number.isNaN(numericId) ? String(id) : numericId
}

export function idsAreEqual(a, b) {
	const normalizedA = normalizeId(a)
	const normalizedB = normalizeId(b)
	return normalizedA !== null && normalizedB !== null && normalizedA === normalizedB
}
