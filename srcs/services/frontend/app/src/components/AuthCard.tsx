import bg from '../assets/site.webp'

interface AuthCardProps {
	title: string
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
	children: React.ReactNode
	privacyPolicy: React.ReactNode
	termsOfService: React.ReactNode
}

function AuthCard({ title, onSubmit, children, privacyPolicy, termsOfService }: AuthCardProps) {
	return (
		<div className="relative isolate flex flex-col items-center min-h-screen overflow-y-auto bg-gray-100">
			<img
				src={bg}
				className="bg-image"
			/>
			<h1 className="shrink-0 mt-32 text-center text-white text-8xl font-bold drop-shadow">
				Nom du site
			</h1>
			<div className="flex flex-1 flex-col items-center justify-center gap-3 w-full max-w-sm py-8">
				<form
					onSubmit={onSubmit}
					className="flex flex-col gap-4 bg-white/90 p-8 rounded-lg drop-shadow w-full">
					<h2 className="text-2xl font-bold text-center text-gray-800">{title}</h2>
					{children}
				</form>
				<p className="text-center text-xs">
					{privacyPolicy} | {termsOfService}
				</p>
			</div>
		</div>
	)
}

export default AuthCard
