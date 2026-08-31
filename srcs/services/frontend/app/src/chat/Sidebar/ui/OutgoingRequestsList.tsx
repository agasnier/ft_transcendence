interface OutgoingRequest {
	id: number
	pseudo: string
	displayName: string | null
}

interface OutgoingRequestListProps {
	outgoing: OutgoingRequest[]
}

function OutgoingRequestList({ outgoing }: OutgoingRequestListProps) {
	return (
		<div className="bg-gray-100 rounded-3xl p-4">
			<h2 className="font-semibold text-gray-700 mb-2">Demandes envoyées</h2>
				{outgoing.length === 0 ? (
				<p className="text-sm text-gray-400">Aucune demande envoyée</p>
				) : (
					<ul className="flex flex-col gap-1">
						{outgoing.map((request) => (
							<li
								key={request.id}
								className="flex items-center justify-between rounded-2xl">
								<span className="text-sm text-gray-700">{request.displayName ?? request.pseudo}</span>
								<span className="text-xs text-gray-400">En attente</span>
							</li>
						))}
					</ul>
				)}
		</div>
	)
}

export default OutgoingRequestList
