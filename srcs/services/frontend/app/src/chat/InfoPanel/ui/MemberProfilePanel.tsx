import { useState, useEffect } from "react"
import { IconInfo } from '../../../icons'
import BackButton from "../../Sidebar/ui/BackButton"

interface Member {
	userId: number
	role: 'moderator' | 'member'
	pseudo: string
	avatarUrl?: string | null
	globalRole?: 'admin' | 'moderator' | 'user'
}

interface PublicProfile {
	id: number
	displayName: string | null
	avatarUrl: string
	bio: string | null
	isOnline: boolean
	role: 'admin' | 'moderator' | 'user'
}

interface MemberProfilePanelProps {
	channelId: number
	member: Member
	userId: number | null
	isModerator: boolean
	myRole: 'admin' | 'moderator' | 'user' | null
	onBack: () => void
	onUpdateMemberRole?: (channelId: number, userId: number, role: 'moderator' | 'member') => Promise<boolean>
	onRemoveMember?: (channelId: number, userId: number) => Promise<boolean>
	onMembersChange: () => void
}

function MemberProfilePanel({channelId, member, userId, isModerator, myRole, onBack, onUpdateMemberRole, onRemoveMember, onMembersChange}: MemberProfilePanelProps) {
	const [profile, setProfile] = useState<PublicProfile | null>(null)
	const [role, setRole] = useState(member.role)
	const [isSavingMemberRole, setIsSavingMemberRole] = useState(false)
	const [isRemovingMember, setIsRemovingMember] = useState(false)
	const [confirmRemove, setConfirmRemove] = useState(false)
	
	useEffect(() => {
		setProfile(null)
		setRole(member.role)
		setConfirmRemove(false)

		async function loadProfile() {
			const res = await fetch(`/users/${member.userId}/profile`)
			if (res.ok)
				setProfile(await res.json())
		}
		loadProfile()
	}, [member.userId, member.role])

	async function handleToggleMemberRole() {
		if (!onUpdateMemberRole)
			return
		const newRole = role === 'moderator' ? 'member' : 'moderator'
		setIsSavingMemberRole(true)
		const ok = await onUpdateMemberRole(channelId, member.userId, newRole)
		if (ok) {
			setRole(newRole)
			onMembersChange()
		}
		setIsSavingMemberRole(false)
	}

	async function handleRemoveMember() {
		if (!onRemoveMember)
			return
		setIsRemovingMember(true)
		const ok = await onRemoveMember(channelId, member.userId)
		setIsRemovingMember(false)
		if (ok) {
			onMembersChange()
			onBack()
		}
	}

	const canManage = isModerator && member.userId !== userId && (myRole === 'admin' || profile?.role !== 'admin')

	return (
		<aside className="absolute top-0 right-0 h-full w-90 shadow-2xl rounded-3xl flex flex-col gap-2 p-4 bg-gray-100 z-10">
			<span className="flex items-center gap-2">
				<BackButton onClick={() => { onBack() }} />
				<h2 className="view-title">Profil</h2>
			</span>
			<div className="flex flex-1 flex-col items-center gap-2 font-semibold text-gray-800 py-2 min-h-0">
				{profile?.avatarUrl ? (
					<img
						src={profile.avatarUrl}
						alt={member.pseudo}
						className="w-30 h-30 rounded-full object-cover"
					/>
				) : (
					<span className="avatar-circle bg-user w-30 h-30 text-6xl">
						{member.pseudo.charAt(0).toUpperCase()}
					</span>
				)}
				<h1 className="font-bold text-gray-800 text-lg truncate">{member.pseudo}</h1>
				{profile?.isOnline !== undefined && (
					<span className={`text-sm ${profile.isOnline ? 'text-green-500' : 'text-red-500'}`}>
						{profile.isOnline ? 'En ligne' : 'Hors ligne'}
					</span>
				)}
				<span className="text-xs text-gray-500">
					{profile?.role === 'admin' ? 'Admin' : role === 'moderator' ? 'Modérateur' : 'Membre'}
				</span>
				{canManage && onUpdateMemberRole && (
					<button
						type="button"
						onClick={handleToggleMemberRole}
						disabled={isSavingMemberRole}
						className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50">
						{isSavingMemberRole ? '...' : (role === 'moderator' ? 'Rétrograder' : 'Promouvoir modérateur')}
					</button>
				)}
				{profile && (
					<div className="flex flex-col w-full text-sm font-normal rounded-2xl bg-white gap-1 p-2">
						<h2 className="font-bold flex items-center gap-1"><IconInfo size={14}/> bio</h2>
						<p className="whitespace-pre-line wrap-break-word">
							{profile.bio || <span className="text-gray-300 italic">Aucune bio</span>}
						</p>
					</div>
				)}
				{canManage && onRemoveMember && (
					<div className="w-full mt-2">
						{confirmRemove ? (
							<div className="flex flex-col gap-2">
								<p className="text-xs text-gray-600 text-center">Retirer {member.pseudo} du salon ?</p>
								<div className="flex justify-center gap-2">
									<button
										type="button"
										onClick={handleRemoveMember}
										disabled={isRemovingMember}
										className="text-sm px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
										{isRemovingMember ? '...' : 'Confirmer'}
									</button>
									<button
										type="button"
										onClick={() => setConfirmRemove(false)}
										disabled={isRemovingMember}
										className="text-sm px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">
										Annuler
									</button>
								</div>
							</div>
						) : (
							<button
								type="button"
								onClick={() => setConfirmRemove(true)}
								className="w-full text-left px-3 py-2 text-sm text-red-600 bg-white hover:bg-red-100 rounded-xl">
								Retirer du salon
							</button>
						)}
					</div>
				)}
			</div>
		</aside>
	)
}

export default MemberProfilePanel
