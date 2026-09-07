import { useState } from 'react'

export const DEFAULT_IMAGE_FALLBACK = '/images/product-placeholder.svg'

function SafeImage({ src, fallbackSrc = DEFAULT_IMAGE_FALLBACK, onError, ...imageProps }) {
	const [failedSource, setFailedSource] = useState(null)
	const shouldUseFallback = !src || failedSource === src
	const displayedSource = shouldUseFallback ? fallbackSrc : src

	const handleError = (event) => {
		if (shouldUseFallback) return

		setFailedSource(src)
		onError?.(event)
	}

	return <img {...imageProps} src={displayedSource} onError={handleError} />
}

export default SafeImage
