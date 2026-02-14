import { BottomSheet } from '@/components/ui/BottomSheet'
import { FontSettings } from '@/features/settings/FontSettings'
import { ThemePicker } from '@/features/settings/ThemePicker'
import { useReaderStore } from '@/store/readerStore'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const fontSize = useReaderStore((state) => state.fontSize)
  const lineHeight = useReaderStore((state) => state.lineHeight)
  const pageWidth = useReaderStore((state) => state.pageWidth)
  const theme = useReaderStore((state) => state.theme)

  const setFontSize = useReaderStore((state) => state.setFontSize)
  const setLineHeight = useReaderStore((state) => state.setLineHeight)
  const setPageWidth = useReaderStore((state) => state.setPageWidth)
  const setTheme = useReaderStore((state) => state.setTheme)

  return (
    <BottomSheet open={open} title="阅读设置" onClose={onClose}>
      <ThemePicker value={theme} onChange={setTheme} />
      <FontSettings
        fontSize={fontSize}
        lineHeight={lineHeight}
        pageWidth={pageWidth}
        onFontSizeChange={setFontSize}
        onLineHeightChange={setLineHeight}
        onPageWidthChange={setPageWidth}
      />
    </BottomSheet>
  )
}
