import { useEffect } from 'react'

export function usePolling(callback: () => void, intervalMs: number) {
	useEffect(() => {
		callback()
		const intervalId = setInterval(callback, intervalMs)
		return () => clearInterval(intervalId)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}
