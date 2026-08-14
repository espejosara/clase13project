export function normalizeId(id) {
	const numericId = Number(id)
	return Number.isNaN(numericId) ? null : numericId
}

export function idsAreEqual(a, b) {
	const normalizedA = normalizeId(a)
	const normalizedB = normalizeId(b)
	return normalizedA !== null && normalizedB !== null && normalizedA === normalizedB
}
