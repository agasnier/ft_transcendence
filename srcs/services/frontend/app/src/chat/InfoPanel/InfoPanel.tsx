import { useState, useEffect } from 'react'
import { IconInfo } from '../../icons'
import BackButton from "../Sidebar/ui/BackButton"
import ChannelAvatarSection from './ui/ChannelAvatarSection'
import MemberProfilePanel from './ui/MemberProfilePanel'
import ChannelNameSection from './ui/ChannelNameSection'
import WriteModeToggle from './ui/WriteModeToggle'
import DescriptionSection from './ui/DescriptionSection'
import MembersList from './ui/MembersList'

interface Member {
	userId: number
	role: 'moderator' | 'member'
	pseudo: string
	avatarUrl?: string | null
	globalRole?: 'admin' | 'moderator' | 'user'
}

interface Channel {
	id: number
	name: string | null
	description: string | null
	type: 'channel' | 'group' | 'discussion'
	avatarUrl?: string | null
	otherUserId?: number
	writeMode?: 'everyone' | 'moderators_only'
}

interface PublicProfile {
	id: number
	displayName: string | null
	avatarUrl: string
	bio: string | null
	isOnline: boolean
	role: 'admin' | 'moderator' | 'user'
}

interface InfoPanelProps {
	channel: Channel
	userId: number | null
	onBack: () => void
	onDeleteChannel: (id: number) => void
	onRenameChannel: (id: number, name: string) => Promise<boolean>
	onUpdateDescription?: (id: number, description: string) => Promise<boolean>
	onAddMembers?: (channelId: number, memberIds: number[]) => Promise<boolean>
	onUpdateWriteMode?: (id: number, writeMode: 'everyone' | 'moderators_only') => Promise<boolean>
	onUpdateMemberRole?: (channelId: number, userId: number, role: 'moderator' | 'member') => Promise<boolean>
	onRemoveMember?: (channelId: number, userId: number) => Promise<boolean>
	onUploadAvatar?: (channelId: number, file: File) => Promise<{ avatarUrl: string } | null>
	onDeleteAvatar?: (channelId: number) => Promise<boolean>
}

function InfoPanel({ channel, userId, onBack, onDeleteChannel, onRenameChannel, onUpdateDescription, onAddMembers, onUpdateWriteMode, onUpdateMemberRole, onRemoveMember, onUploadAvatar, onDeleteAvatar }: InfoPanelProps) {
	const [members, setMembers] = useState<Member[] | null>(null)
	const [otherProfile, setOtherProfile] = useState<PublicProfile | null>(null)
	const [selectedMember, setSelectedMember] = useState<Member | null>(null)
	const [myRole, setMyRole] = useState<'admin' | 'moderator' | 'user' | null>(null)

	const isModerator = myRole === 'admin' || (members?.some((m) => m.userId === userId && m.role === 'moderator') ?? false)

	async function loadMembers() {
		if (channel.type === 'discussion')
			return

		const res = await fetch(`/chat/channels/${channel.id}/members`)
		if (!res.ok)
			return
		const rows: { userId: number; role: 'moderator' | 'member' }[] = await res.json()
		if (rows.length === 0) {
			setMembers([])
			return
		}
		const usersRes = await fetch(`/users/batch?ids=${rows.map((r) => r.userId).join(',')}`)
		if (!usersRes.ok)
			return
		const users: { id: number; pseudo: string; avatarUrl: string | null; role?: 'admin' | 'moderator' | 'user' }[] = await usersRes.json()
		const infoById = new Map(users.map((u) => [u.id, u]))
		const membersList: Member[] = rows.map((r) => ({
			...r,
			pseudo: infoById.get(r.userId)?.pseudo ?? '?',
			avatarUrl: infoById.get(r.userId)?.avatarUrl ?? null,
			globalRole: infoById.get(r.userId)?.role,
		}))
		membersList.sort((a, b) => {
			if (a.globalRole === 'admin' && b.globalRole !== 'admin') return -1
			if (b.globalRole === 'admin' && a.globalRole !== 'admin') return 1
			if (a.role !== b.role)
				return a.role === 'moderator' ? -1 : 1
			return a.pseudo.localeCompare(b.pseudo)
		})
		setMembers(membersList)
	}

	useEffect(() => {
		loadMembers()
		setSelectedMember(null)
	}, [channel.id, channel.type])

	useEffect(() => {
		if (channel.type !== 'discussion' || channel.otherUserId === undefined)
			return

		async function loadOtherProfile() {
			const res = await fetch(`/users/${channel.otherUserId}/profile`)
			if (res.ok)
				setOtherProfile(await res.json())
		}
		loadOtherProfile()
	}, [channel.type, channel.otherUserId])

	useEffect(() => {
		async function fetchMyRole() {
			const res = await fetch('/users/profile')
			if (res.ok) {
				const data = await res.json()
				setMyRole(data.role)
			}
		}
		fetchMyRole()
	}, [])

	// Sub-panel: profile of a clicked member
	if (selectedMember) {
		return (
			<MemberProfilePanel
				channelId={channel.id}
				member={selectedMember}
				userId={userId}
				isModerator={isModerator}
				myRole={myRole}
				onBack={() => setSelectedMember(null)}
				onUpdateMemberRole={onUpdateMemberRole}
				onRemoveMember={onRemoveMember}
				onMembersChange={loadMembers}
			/>
		)
	}

	return (
		<aside className="absolute top-0 right-0 h-full w-90 shadow-2xl rounded-3xl flex flex-col gap-2 p-4 bg-gray-100 z-10">
			<span className="flex items-center gap-2">
				<BackButton onClick={onBack} />
				<h2 className="view-title">Infos
					{channel.type === 'discussion' ? " de l'utilisateur" : ''}
					{channel.type === 'group' ? ' du groupe' : ''}
					{channel.type === 'channel' ? ' du canal' : ''}
				</h2>
			</span>

			<div className="flex flex-1 flex-col items-center gap-2 font-semibold text-gray-800 py-2 min-h-0">
				<ChannelAvatarSection
					channel={channel}
					isModerator={isModerator}
					otherProfile={otherProfile}
					onUploadAvatar={onUploadAvatar}
					onDeleteAvatar={onDeleteAvatar}
				/>
				<ChannelNameSection
					channel={channel}
					isModerator={isModerator}
					otherProfile={otherProfile}
					memberCount={members?.length ?? null}
					onRenameChannel={onRenameChannel}
				/>
				{channel.type === 'discussion' && otherProfile && (
					<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-2">
						<h2 className="font-bold flex items-center gap-1"><IconInfo size={14}/> bio</h2>
						<p className="whitespace-pre-line wrap-break-word">
							{otherProfile.bio || <span className="text-gray-300 italic">Aucune bio</span>}
						</p>
					</div>
				)}
				{channel.type !== 'discussion' && (
					<DescriptionSection
						channel={channel}
						isModerator={isModerator}
						onUpdateDescription={onUpdateDescription}/>
				)}

				{channel.type === 'channel' && isModerator && (
					<WriteModeToggle channel={channel} onUpdateWriteMode={onUpdateWriteMode}/>
				)}

				{channel.type !== 'discussion' && (
					<MembersList
						key={channel.id}
						channelId={channel.id}
						members={members}
						isModerator={isModerator}
						onSelectMember={setSelectedMember}
						onAddMembers={onAddMembers}
						onMembersChanged={loadMembers}/>
				)}
			</div>

			<button
				type="button"
				onClick={() => (
					onDeleteChannel(channel.id)
				)}
				className="mt-auto w-full text-left px-3 py-2 text-sm text-danger bg-white hover:bg-danger-bg rounded-xl">
				Supprimer la conversation
			</button>
		</aside>
	)
}

export default InfoPanel
