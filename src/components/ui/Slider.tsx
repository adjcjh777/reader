import type { InputHTMLAttributes } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  valueLabel?: string
}

export function Slider({
  label,
  valueLabel,
  className,
  ...props
}: SliderProps) {
  return (
    <label className={`ui-slider${className ? ` ${className}` : ''}`}>
      {(label || valueLabel) && (
        <span className="ui-slider__label-row">
          <span>{label}</span>
          <span className="ui-slider__value">{valueLabel}</span>
        </span>
      )}
      <input className="ui-slider__input" type="range" {...props} />
    </label>
  )
}
