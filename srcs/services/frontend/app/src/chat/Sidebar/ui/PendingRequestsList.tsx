interface PendingRequest {
	id: number
	pseudo: string
	displayName: string | null
}

interface PendingRequestsListProps {
	pending: PendingRequest[]
	onAccept: (id: number) => void
	onDecline: (id: number) => void
}

function PendingRequestsList({ pending, onAccept, onDecline }: PendingRequestsListProps) {
	return (
		<div className="bg-gray-100 rounded-3xl p-4">
			<h2 className="font-semibold text-gray-700 mb-2">Demandes reçues</h2>
			{pending.length === 0 ? (
				<p className="text-sm text-gray-400">Aucune demande</p>
			) : (
				<ul className="flex flex-col gap-1">
					{pending.map((request) => (
						<li key={request.id} className="flex items-center justify-between rounded-2xl">
							<span className="text-sm text-gray-700">{request.displayName ?? request.pseudo}</span>
							<span className="flex gap-1">
								<button type="button" onClick={() => onAccept(request.id)} className="text-xs bg-user text-white rounded-full px-2 py-1 hover:bg-blue-600">Accepter</button>
								<button type="button" onClick={() => onDecline(request.id)} className="text-xs bg-gray-300 text-gray-700 rounded-full px-2 py-1 hover:bg-gray-400">Refuser</button>
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default PendingRequestsList
