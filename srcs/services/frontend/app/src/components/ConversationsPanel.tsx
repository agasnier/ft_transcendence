interface ConversationsPanelProps {
	isSearching: boolean
}

function ConversationsPanel({ isSearching }: ConversationsPanelProps) {
	return (
		<div className={`${isSearching ? 'bg-white' : 'bg-gray-100'} rounded-3xl p-4`}>
			<p className="text-sm text-gray-400">Aucune conversation</p>
		</div>
	)
}

export default ConversationsPanel
