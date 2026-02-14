interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="ui-switch">
      {label && <span>{label}</span>}
      <button
        className={`ui-switch__control${checked ? ' is-checked' : ''}`}
        onClick={() => onChange(!checked)}
        type="button"
        role="switch"
        aria-checked={checked}
      >
        <span className="ui-switch__thumb" />
      </button>
    </label>
  )
}
