import { useEffect } from "react";

// Closes the popover when the user clicks outside the element `selector` or presses Escape
// Escape is caught on the capture phase (`true` + stopPropagation)
// It takes priority over other Escape handlers elsewhere in the app
export function useClickOutside(isOpen: boolean, selector: string, onClose: () => void) {
	useEffect(() => {
		if (!isOpen)
			return

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
	}, [isOpen, selector, onClose])
}
