import AvatarUploader from "../../../components/AvatarUploader"
import { useUserAvatars } from "../../../hooks/presence"

interface Channel {
	id: number
	name: string | null
	type: 'channel' | 'group' | 'discussion'
	avatarUrl?: string | null
	otherUserId?: number
}

interface PublicProfile {
	avatarUrl: string
}

interface ChannelAvatarSectionProps {
	channel: Channel
	isModerator: boolean
	otherProfile: PublicProfile | null
	onUploadAvatar?: (channelId: number, file: File) => Promise<{ avatarUrl: string } | null>
	onDeleteAvatar?: (channelId: number) => Promise<boolean>
}

function ChannelAvatarSection({channel, isModerator, otherProfile, onUploadAvatar, onDeleteAvatar}: ChannelAvatarSectionProps) {

	async function handleUpload(file: File): Promise<boolean> {
		if (onUploadAvatar) {
			const res = await onUploadAvatar(channel.id, file)
			return res !== null
		}
		const formData = new FormData()
		formData.append('file', file)
		const res = await fetch(`/chat/channels/${channel.id}/avatar`, { method: 'POST', body: formData })
		return res.ok
	}

	async function handleDelete(): Promise<boolean> {
		if (onDeleteAvatar)
			return onDeleteAvatar(channel.id)
		const res = await fetch(`/chat/channels/${channel.id}/avatar`, { method: 'DELETE' })
		return res.ok
	}

	const userAvatars = useUserAvatars()
	const live = channel.otherUserId !== undefined ? userAvatars.get(channel.otherUserId) : undefined
	const avatarUrl = channel.type === 'discussion'
		? (live?.avatarUrl !== undefined ? live.avatarUrl : (otherProfile?.avatarUrl ?? channel.avatarUrl))
		: channel.avatarUrl
	const displayName = live?.pseudo ?? channel.name

	return (
		<AvatarUploader
			avatarUrl={avatarUrl}
			fallbackLabel={displayName?.charAt(0).toUpperCase() ?? '?'}
			fallbackBgClass={channel.type === 'discussion' ? 'bg-user' : 'bg-conversation'}
			editable={channel.type !== 'discussion' && isModerator}
			label="le logo du salon"
			onUploadAvatar={handleUpload}
			onDeleteAvatar={handleDelete}
		/>
	)
}

export default ChannelAvatarSection
