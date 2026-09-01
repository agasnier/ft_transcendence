import { useEffect, useRef } from 'react'

// Repeatedly calls the `callback` function on a timer
// Runs once immediately, then every `intervalMs`, until the component unmounts
// Typical use: periodically re-fetching data from the server
export function usePolling(callback: () => void, intervalMs: number) {
	const callbackRef = useRef(callback)
	callbackRef.current = callback

	useEffect(() => {
		callbackRef.current()
		const intervalId = setInterval(() => callbackRef.current(), intervalMs)
		return () => clearInterval(intervalId)
	}, [intervalMs])
}
