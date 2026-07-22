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
		<div className="relative isolate flex flex-col items-center justify-center gap-4 min-h-screen bg-gray-100">
			<img
				src={bg}
				className="absolute inset-0 -z-10 w-full h-full object-cover object-right"
			/>
			<h1 className="text-center text-white text-8xl font-bold drop-shadow">
				Nom du site
			</h1>
			<div className="flex flex-col items-center justify-center gap-3 w-full max-w-sm min-h-[420px]">
				<form
					onSubmit={onSubmit}
					className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md w-full">
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
