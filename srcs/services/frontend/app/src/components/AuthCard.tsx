interface AuthCardProps {
	title: string
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
	children: React.ReactNode
}

function AuthCard({ title, onSubmit, children }: AuthCardProps) {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<form
				onSubmit={onSubmit}
				className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
			>
				<h2 className="text-2xl font-bold text-center text-gray-800">{title}</h2>
				{children}
			</form>
		</div>
	)
}

export default AuthCard
