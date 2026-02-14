import { Button } from '@/components/ui/Button'

interface PageTurnerProps {
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function PageTurner({
  canPrev,
  canNext,
  onPrev,
  onNext,
}: PageTurnerProps) {
  return (
    <div className="page-turner">
      <Button variant="secondary" disabled={!canPrev} onClick={onPrev}>
        上一章
      </Button>
      <Button variant="secondary" disabled={!canNext} onClick={onNext}>
        下一章
      </Button>
    </div>
  )
}
