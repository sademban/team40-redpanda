interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  onFocus,
  placeholder = 'Search a feeling, memory, or line',
  className = '',
}: SearchInputProps) {
  return (
    <label className={`field search-shell ${className}`.trim()}>
      <span className="sr-only">Search by feeling, memory, or line</span>
      <svg
        className="search-shell__icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 16L21 21"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
      <input
        className="field__input"
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  )
}
