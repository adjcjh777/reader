import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { ReaderTheme } from '@/store/readerStore'

interface ThemePickerProps {
  value: ReaderTheme
  onChange: (theme: ReaderTheme) => void
}

const themeOptions: Array<{ value: ReaderTheme; label: string }> = [
  { value: 'light', label: '浅色' },
  { value: 'sepia', label: '米色' },
  { value: 'dark', label: '深色' },
]

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <section className="settings-block">
      <h4>阅读主题</h4>
      <SegmentedControl items={themeOptions} value={value} onChange={onChange} />
    </section>
  )
}
