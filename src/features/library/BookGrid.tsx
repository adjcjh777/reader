import type { BookData } from '@/types/book'
import { BookCard } from '@/features/library/BookCard'

interface BookGridProps {
  books: BookData[]
  onOpen: (book: BookData) => void
}

export function BookGrid({ books, onOpen }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="empty-state">
        <h3>书库还没有书</h3>
        <p>先导入一本书，开始你的阅读空间。</p>
      </div>
    )
  }

  return (
    <section className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onOpen={onOpen} />
      ))}
    </section>
  )
}
