interface TextFieldProps {
	id: string
	label: string
	type: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	required?: boolean
	autoFocus?: boolean
}

function TextField({ id, label, type, value, onChange, required, autoFocus }: TextFieldProps) {
	return (
		<div className="relative">
			<input
				id={id}
				type={type}
				placeholder=" "
				value={value}
				onChange={onChange}
				required={required}
				autoFocus={autoFocus}
				className="peer w-full border border-gray-300 rounded-md px-3 pt-5 pb-1 hover:border-blue-500 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-blue-500"
			/>
			<label
				htmlFor={id}
				className="absolute left-3 top-1 text-xs text-gray-500 transition-all duration-150 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs">
				{label}
			</label>
		</div>
	)
}

export default TextField
