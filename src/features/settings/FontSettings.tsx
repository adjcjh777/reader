import { Slider } from '@/components/ui/Slider'

interface FontSettingsProps {
  fontSize: number
  lineHeight: number
  pageWidth: number
  onFontSizeChange: (value: number) => void
  onLineHeightChange: (value: number) => void
  onPageWidthChange: (value: number) => void
}

export function FontSettings({
  fontSize,
  lineHeight,
  pageWidth,
  onFontSizeChange,
  onLineHeightChange,
  onPageWidthChange,
}: FontSettingsProps) {
  return (
    <section className="settings-block">
      <h4>排版参数</h4>
      <Slider
        label="字号"
        min={14}
        max={30}
        step={1}
        value={fontSize}
        valueLabel={`${fontSize}px`}
        onChange={(event) => onFontSizeChange(Number(event.target.value))}
      />
      <Slider
        label="行高"
        min={1.2}
        max={2.4}
        step={0.1}
        value={lineHeight}
        valueLabel={lineHeight.toFixed(1)}
        onChange={(event) => onLineHeightChange(Number(event.target.value))}
      />
      <Slider
        label="版心宽度"
        min={560}
        max={980}
        step={10}
        value={pageWidth}
        valueLabel={`${pageWidth}px`}
        onChange={(event) => onPageWidthChange(Number(event.target.value))}
      />
    </section>
  )
}
