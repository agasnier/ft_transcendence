import { useEffect } from "react";

export function useClickOutside(active: boolean, selector: string, onClose: () => void) {
	useEffect(() => {
		if (!active) return

		function handleClickOutside(event: MouseEvent) {
			if (!(event.target as HTMLElement).closest(selector))
				onClose()
		}
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.stopPropagation()
				onClose()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleKeyDown, true)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown, true)
		}
	}, [active, selector, onClose])
}
