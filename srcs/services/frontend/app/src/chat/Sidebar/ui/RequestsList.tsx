import { useUserAvatars } from '../../../hooks/presence'

interface Request {
	id: number
	pseudo: string
	displayName: string | null
}

interface RequestsListProps {
	title: string
	emptyText: string
	requests: Request[]
	renderAction: (request: Request) => React.ReactNode
}

function RequestsList({ title, emptyText, requests, renderAction }: RequestsListProps) {
	const userAvatars = useUserAvatars()
	return (
		<div className="bg-gray-100 rounded-3xl p-4">
			<h2 className="font-semibold text-gray-700 mb-2">{title}</h2>
			{requests.length === 0 ? (
				<p className="text-sm text-gray-400">{emptyText}</p>
			) : (
				<ul className="flex flex-col gap-1">
					{requests.map((request) => (
						<li key={request.id} className="flex items-center justify-between rounded-2xl">
							<span className="text-sm text-gray-700">{request.displayName ?? userAvatars.get(request.id)?.pseudo ?? request.pseudo}</span>
								{renderAction(request)}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default RequestsList
