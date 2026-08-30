import { useState, useEffect } from 'react'

export function useIsWide(breakpoint = 1024): boolean {
	const [isWide, setIsWide] = useState(() => window.innerWidth > breakpoint)

	useEffect(() => {
		const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
		const onChange = () => setIsWide(mq.matches)
		mq.addEventListener('change', onChange)
		return () => mq.removeEventListener('change', onChange)
	}, [breakpoint])

	return isWide
}
