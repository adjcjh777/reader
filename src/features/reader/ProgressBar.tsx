interface ProgressBarProps {
  value: number
  max: number
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const safeMax = Math.max(max, 1)
  const safeValue = Math.min(Math.max(value, 0), safeMax)
  const ratio = (safeValue / safeMax) * 100

  return (
    <footer className="progress-bar">
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${ratio}%` }} />
      </div>
      <span>
        第 {safeValue} / {safeMax} 章
      </span>
    </footer>
  )
}
