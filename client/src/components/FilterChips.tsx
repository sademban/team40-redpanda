interface FilterOption {
  value: string
  label: string
}

interface FilterChipsProps {
  options: FilterOption[]
  selected: string
  onSelect: (value: string) => void
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="chip-group" role="list" aria-label="Feeling filters">
      {options.map((option) => (
        <button
          key={option.value}
          className={`chip ${selected === option.value ? 'is-active' : ''}`}
          onClick={() => onSelect(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
