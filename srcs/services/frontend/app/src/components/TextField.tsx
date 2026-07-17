interface TextFieldProps {
	id: string
	type: string
	placeholder: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	required?: boolean
}

function TextField({ id, type, placeholder, value, onChange, required }: TextFieldProps) {
	return (
		<input
			id={id}
			type={type}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			required={required}
			className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-blue-500"
		/>
	)
}

export default TextField
