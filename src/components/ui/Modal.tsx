import type { PropsWithChildren, ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title?: ReactNode
  onClose: () => void
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: PropsWithChildren<ModalProps>) {
  if (!open) {
    return null
  }

  return (
    <div className="ui-modal" role="dialog" aria-modal="true">
      <button className="ui-modal__backdrop" onClick={onClose} aria-label="关闭" />
      <div className="ui-modal__content page-transition">
        <header className="ui-modal__header">
          <strong>{title}</strong>
          <button className="ui-button ui-button--ghost" onClick={onClose}>
            关闭
          </button>
        </header>
        <section className="ui-modal__body">{children}</section>
      </div>
    </div>
  )
}
