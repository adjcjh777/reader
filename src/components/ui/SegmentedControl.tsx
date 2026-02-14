import type { ReactNode } from 'react'

interface SegmentItem<T extends string> {
  value: T
  label: ReactNode
}

interface SegmentedControlProps<T extends string> {
  items: SegmentItem<T>[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="ui-segmented" role="tablist">
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            className={`ui-segmented__item${active ? ' is-active' : ''}`}
            onClick={() => onChange(item.value)}
            role="tab"
            aria-selected={active}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
