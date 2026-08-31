import { useState, useRef } from 'react'
import { IconEdit, IconDelete } from '../icons'
import { MAX_AVATAR_FILE_SIZE } from '../limits'

interface AvatarUploaderProps {
	avatarUrl: string | null | undefined
	fallbackLabel: string
	fallbackBgClass: string
	editable: boolean
	label: string
	onUploadAvatar: (file: File) => Promise<boolean>
	onDeleteAvatar: () => Promise<boolean>
}

function AvatarUploader({ avatarUrl, fallbackLabel, fallbackBgClass, editable, label, onUploadAvatar, onDeleteAvatar }: AvatarUploaderProps) {
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
	const [avatarError, setAvatarError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file)
			return

		if (file.size > MAX_AVATAR_FILE_SIZE) {
			setAvatarError('Fichier trop volumineux (max 5 Mo)')
			if (fileInputRef.current)
				fileInputRef.current.value = ''
			return
		}

		setAvatarError(null)
		setIsUploadingAvatar(true)

		if (onUploadAvatar) {
			const res = await onUploadAvatar(file)
			if (!res) {
				setAvatarError("Échec de l'upload du logo")
			}
		}
		setIsUploadingAvatar(false)
		if (fileInputRef.current)
			fileInputRef.current.value = ''
	}

	async function handleDeleteAvatar() {
		setAvatarError(null)
		setIsUploadingAvatar(true)

		if (onDeleteAvatar) {
			const ok = await onDeleteAvatar()
			if (!ok) {
				setAvatarError('Échec de la suppression du logo')
			}
		}
		setIsUploadingAvatar(false)
	}

	return (
		<>
			<div className="relative">
				{avatarUrl ? (
						<img
							src={avatarUrl}
							alt="avatar"
							className="w-30 h-30 rounded-full object-cover"
						/>
					) : (
						<span className={`avatar-circle ${fallbackBgClass} w-30 h-30 text-6xl`}>
							{fallbackLabel}
						</span>
				)}
				{editable && (
					<>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploadingAvatar}
							title={`Changer ${label}`}
							className="absolute bottom-0 right-0 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md disabled:opacity-50">
							{isUploadingAvatar ? '...' : <IconEdit size={16} className="icon-hover-grow"/>}
						</button>
						{avatarUrl && (
							<button
								type="button"
								onClick={handleDeleteAvatar}
								disabled={isUploadingAvatar}
								title={`Supprimer ${label}`}
								className="absolute bottom-0 left-0 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md disabled:opacity-50">
								<IconDelete size={16} className="hover:text-red-500 icon-hover-grow"/>
							</button>
						)}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onChange={handleAvatarChange}
							className="hidden"
						/>
					</>
				)}
			</div>
			{avatarError && <p className="text-xs text-red-600">{avatarError}</p>}
		</>
	)
}

export default AvatarUploader
