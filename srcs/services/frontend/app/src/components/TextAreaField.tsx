import { MAX_SHORT_TEXT_LENGTH } from '../limits'

interface TextAreaFieldProps {
	id: string
	label: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
	required?: boolean
	autoFocus?: boolean
}

function TextAreaField({ id, label, value, onChange, required, autoFocus }: TextAreaFieldProps) {
	return (
		<div className="relative">
			<textarea
				id={id}
				placeholder=" "
				value={value}
				onChange={onChange}
				required={required}
				autoFocus={autoFocus}
				maxLength={MAX_SHORT_TEXT_LENGTH}
				rows={Math.max(1, value.split('\n').length)}
				className="peer w-full border border-gray-300 rounded-md px-3 pt-4 pb-1 hover:border-blue-500 focus:outline-none focus:ring-2 ring-offset-2 focus:ring-blue-500 resize-none overflow-hidden"
			/>
			<label
				htmlFor={id}
				className="absolute left-3 top-0 text-xs text-gray-500 transition-all duration-150 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-xs">
				{label}
			</label>
		</div>
	)
}

export default TextAreaField
