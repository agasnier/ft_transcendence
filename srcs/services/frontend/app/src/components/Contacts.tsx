import { useState, useEffect, useRef } from 'react'

interface ContactsProps {
	onBack: () => void
}

function Contacts ({onBack}: ContactsProps) {
	return (
		<aside className="w-80 shrink-0 shadow-2xl rounded-3xl bg-white flex flex-col overflow-y-auto gap-2 p-2">
			<button
				type="button"
				onClick={onBack}
				className="text-black hover:underline">
				retour
			</button>
			<div className="bg-gray-100 rounded-3xl p-4 flex flex-col gap-2">
			<input
				placeholder='Rechercher'
				className="peer w-full border border-gray-300 rounded-md px-3 pt-5 pb-1 hover:border-blue-500 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-blue-500">
			</input>
			</div>
		</aside>
	)
}

export default Contacts
