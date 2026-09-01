import { useState, useEffect } from 'react'

// Tracks whether the viewport is at least `breakpoint` wide, reacting live to window resizes
// Uses matchMedia instead of a resize listener, so it only re-renders when crossing
// the breakpoint, not on every pixel of resize
export function useIsWide(breakpoint = 1080): boolean {
	const [isWide, setIsWide] = useState(() => window.matchMedia(`(min-width: ${breakpoint}px)`).matches)

	useEffect(() => {
		const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
		const onChange = () => setIsWide(mq.matches)
		mq.addEventListener('change', onChange)
		return () => mq.removeEventListener('change', onChange)
	}, [breakpoint])

	return isWide
}
