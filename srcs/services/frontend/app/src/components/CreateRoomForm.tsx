import { useState } from 'react'
import TextField from './TextField'

interface CreateRoomFormProps {
	type: 'channel' | 'group' | 'discussion'
	onCancel: () => void
	onCreate: (name: string, description: string) => void
}

function CreateRoomForm({ onCancel, onCreate }: CreateRoomFormProps) {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		onCreate(name, description)
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
			<TextField
				id="room-name"
				label="Nom"
				type="text"
				value={name}
				onChange={(e) => setName(e.target.value)}
				required
				autoFocus
			/>
			<TextField
				id="room-description"
				label="Description"
				type="text"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
			/>
			<button
				type="submit"
				className="bg-blue-500 text-white rounded-md py-1 hover:bg-blue-600">
				Créer
			</button>
			<button
				type="button"
				onClick={onCancel}
				className="text-sm text-gray-500 hover:underline">
				Annuler
			</button>
		</form>
	)
}

export default CreateRoomForm
