import { useEffect } from "react";

export function useClickOutside(active: boolean, selector: string, onClose: () => void) {
	useEffect(() => {
		if (!active) return

		function handleClickOutside(event: MouseEvent) {
			if (!(event.target as HTMLElement).closest(selector))
				onClose()
		}
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape')
				onClose()
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [active, selector, onClose])
}
