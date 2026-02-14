import { ArrowLeft, BookmarkPlus, ListTree, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ReaderToolbarProps {
  title: string
  onBack: () => void
  onToggleSettings: () => void
  onToggleToc: () => void
  onAddBookmark: () => void
}

export function ReaderToolbar({
  title,
  onBack,
  onToggleSettings,
  onToggleToc,
  onAddBookmark,
}: ReaderToolbarProps) {
  return (
    <header className="reader-toolbar navbar">
      <div className="reader-toolbar__left">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          返回
        </Button>
      </div>

      <h2 title={title}>{title}</h2>

      <div className="reader-toolbar__right">
        <Button variant="ghost" onClick={onToggleToc}>
          <ListTree size={16} />
          目录
        </Button>
        <Button variant="ghost" onClick={onAddBookmark}>
          <BookmarkPlus size={16} />
          书签
        </Button>
        <Button variant="ghost" onClick={onToggleSettings}>
          <Settings2 size={16} />
          设置
        </Button>
      </div>
    </header>
  )
}
