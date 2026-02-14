import { useMemo } from 'react'
import { ArrowDownAZ, ListFilter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { BookGrid } from '@/features/library/BookGrid'
import { ImportZone } from '@/features/library/ImportZone'
import { useBookParser } from '@/hooks/useBookParser'
import {
  useLibraryStore,
  type LibraryFilter,
  type LibrarySortBy,
} from '@/store/libraryStore'
import { filterAndSortBooks } from '@/store/selectors'
import type { BookData } from '@/types/book'

const filterOptions: Array<{ value: LibraryFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'reading', label: '正在阅读' },
  { value: 'wantToRead', label: '想读' },
  { value: 'finished', label: '已读完' },
]

const sortOptions: Array<{ value: LibrarySortBy; label: string }> = [
  { value: 'recent', label: '最近阅读' },
  { value: 'title', label: '按标题' },
  { value: 'author', label: '按作者' },
]

export function LibraryPage() {
  const navigate = useNavigate()
  const books = useLibraryStore((state) => state.books)
  const sortBy = useLibraryStore((state) => state.sortBy)
  const filter = useLibraryStore((state) => state.filter)
  const setSortBy = useLibraryStore((state) => state.setSortBy)
  const setFilter = useLibraryStore((state) => state.setFilter)
  const setCurrentBook = useLibraryStore((state) => state.setCurrentBook)
  const markBookStatus = useLibraryStore((state) => state.markBookStatus)

  const { importFiles, isParsing, error } = useBookParser()

  const visibleBooks = useMemo(
    () => filterAndSortBooks(books, filter, sortBy),
    [books, filter, sortBy],
  )

  const handleOpenBook = (book: BookData) => {
    setCurrentBook(book.id)
    markBookStatus(book.id, 'reading')
    navigate(`/reader/${book.id}`)
  }

  const handleImport = async (files: FileList | File[]) => {
    await importFiles(files)
  }

  return (
    <main className="library-page page-transition">
      <header className="library-page__header navbar">
        <h1>Reader</h1>
        <p>Apple Books 风格的本地阅读器</p>
      </header>

      <section className="library-page__toolbar">
        <div className="toolbar-group">
          <ListFilter size={16} />
          <SegmentedControl
            items={filterOptions}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <div className="toolbar-group">
          <ArrowDownAZ size={16} />
          <SegmentedControl
            items={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </section>

      <ImportZone onSelect={handleImport} disabled={isParsing} />
      {isParsing && <p className="status-text">正在解析文件...</p>}
      {error && <p className="status-text status-text--error">{error}</p>}

      <BookGrid books={visibleBooks} onOpen={handleOpenBook} />
    </main>
  )
}
