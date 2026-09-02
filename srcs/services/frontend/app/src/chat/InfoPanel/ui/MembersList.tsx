import { useState } from 'react'
import { useOnlineUsers, useUserAvatars } from '../../../hooks/presence'
import AvatarNameCard from '../../Sidebar/ui/AvatarNameCard'
import AddMembersForm from './AddMembersForm'

interface Member {
	userId: number
	role: 'moderator' | 'member'
	pseudo: string
	avatarUrl?: string | null
	globalRole?: 'admin' | 'user'
}

interface MembersListProps {
	channelId: number
	members: Member[] | null
	isModerator: boolean
	onSelectMember: (member: Member) => void
	onAddMembers?: (channelId: number, membersIds: number[]) => Promise<boolean>
	onMembersChanged: () => void
}

function MembersList({ channelId, members, isModerator, onSelectMember, onAddMembers, onMembersChanged }: MembersListProps) {
	const [isAddingMembers, setIsAddingMembers] = useState(false)
	const onlineUserIds = useOnlineUsers()
	const userAvatars = useUserAvatars()

	return (
		<div className="flex flex-1 flex-col self-stretch gap-1 mt-2 bg-white rounded-2xl p-2 min-h-0 overflow-y-auto shadow-sm border border-gray-100">
			<div className="flex items-center justify-between px-1 pb-1 border-b border-gray-100">
				<span className="text-xs font-bold text-gray-600 uppercase">
					Membres ({members?.length ?? 0})
				</span>
				{isModerator && (
					<button
						type="button"
						onClick={() => {
							setIsAddingMembers(!isAddingMembers)
						}}
						className="text-xs font-semibold text-blue-600 hover:underline">
						{isAddingMembers ? 'Fermer' : '+ Ajouter'}
					</button>
				)}
			</div>

			{isAddingMembers ? (
				<AddMembersForm
					channelId={channelId}
					members={members}
					onAddMembers={onAddMembers}
					onAdded={() => {
						setIsAddingMembers(false)
						onMembersChanged()
					}}
				/>
			) : (
				<div className="flex flex-col gap-1 flex-1 overflow-y-auto">
					{members && members.map((m) => (
						<AvatarNameCard
							key={m.userId}
							name={userAvatars.get(m.userId)?.pseudo ?? m.pseudo}
							variant="user"
							avatarUrl={userAvatars.get(m.userId)?.avatarUrl !== undefined
								? userAvatars.get(m.userId)?.avatarUrl
								: m.avatarUrl}
							subtitle={m.globalRole === 'admin' ? 'Admin' : m.role === 'moderator' ? 'Modérateur' : undefined}
							isOnline={onlineUserIds.has(m.userId)}
							onClick={() => onSelectMember(m)}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default MembersList
