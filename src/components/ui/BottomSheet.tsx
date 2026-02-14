import type { PropsWithChildren, ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  title?: ReactNode
  onClose: () => void
}

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: PropsWithChildren<BottomSheetProps>) {
  if (!open) {
    return null
  }

  return (
    <div className="ui-sheet" role="dialog" aria-modal="true">
      <button className="ui-sheet__backdrop" onClick={onClose} aria-label="关闭面板" />
      <section className="ui-sheet__panel page-transition">
        <header className="ui-sheet__header">
          <span className="ui-sheet__grabber" />
          <strong>{title}</strong>
        </header>
        <div className="ui-sheet__body">{children}</div>
      </section>
    </div>
  )
}
