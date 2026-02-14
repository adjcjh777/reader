import { BookOpen, CheckCircle2, Clock3, Sparkles } from 'lucide-react'
import type { BookData } from '@/types/book'

interface BookCardProps {
  book: BookData
  onOpen: (book: BookData) => void
}

const statusMap = {
  reading: {
    label: '正在阅读',
    icon: <BookOpen size={14} />,
  },
  wantToRead: {
    label: '想读',
    icon: <Clock3 size={14} />,
  },
  finished: {
    label: '已读完',
    icon: <CheckCircle2 size={14} />,
  },
}

export function BookCard({ book, onOpen }: BookCardProps) {
  const status = statusMap[book.status]

  return (
    <article className="book-card page-transition">
      <button className="book-card__cover-wrap" onClick={() => onOpen(book)}>
        {book.cover ? (
          <img src={book.cover} alt={`${book.title} 封面`} className="book-cover" />
        ) : (
          <div className="book-cover book-cover--placeholder">
            <Sparkles size={18} />
            <span>{book.format.toUpperCase()}</span>
          </div>
        )}
      </button>

      <div className="book-card__meta">
        <h3 title={book.title}>{book.title}</h3>
        <p>{book.author}</p>
        <span className="book-card__status">
          {status.icon}
          {status.label}
        </span>
      </div>
    </article>
  )
}
