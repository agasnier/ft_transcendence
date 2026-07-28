import { useEffect, useRef } from 'react'

export function usePolling(callback: () => void, intervalMs: number) {
	const callbackRef = useRef(callback)
	callbackRef.current = callback

	useEffect(() => {
		callbackRef.current()
		const intervalId = setInterval(() => callbackRef.current(), intervalMs)
		return () => clearInterval(intervalId)
	}, [intervalMs])
}
