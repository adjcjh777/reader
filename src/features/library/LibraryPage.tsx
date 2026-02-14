import { useMemo } from 'react'
import {
  ArrowDownAZ,
  BookOpen,
  Flame,
  Library,
  ListFilter,
  Loader2,
} from 'lucide-react'
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

  const metrics = useMemo(
    () => ({
      total: books.length,
      reading: books.filter((book) => book.status === 'reading').length,
      finished: books.filter((book) => book.status === 'finished').length,
    }),
    [books],
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
        <div>
          <p className="library-page__eyebrow">资料库</p>
          <h1>Reader</h1>
        </div>
        <span className="library-page__counter">{metrics.total} 本</span>
      </header>

      <section className="library-hero glass-card fade-in">
        <div className="library-hero__copy">
          <p>Apple Books 风格 · 内容优先</p>
          <h2>今天也来读几页</h2>
          <span>把常读的书放在前面，沉浸感从打开书库就开始。</span>
        </div>
        <div className="library-hero__stats">
          <article>
            <BookOpen size={16} />
            <strong>{metrics.reading}</strong>
            <span>正在阅读</span>
          </article>
          <article>
            <Library size={16} />
            <strong>{metrics.total}</strong>
            <span>藏书总数</span>
          </article>
          <article>
            <Flame size={16} />
            <strong>{metrics.finished}</strong>
            <span>已完成</span>
          </article>
        </div>
      </section>

      <section className="library-page__toolbar glass-card">
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

      {isParsing && (
        <p className="status-text status-text--loading">
          <Loader2 size={14} className="status-spin" />
          正在解析文件...
        </p>
      )}

      {error && <p className="status-text status-text--error">{error}</p>}

      <section className="library-section">
        <header className="library-section__header">
          <h2>你的书库</h2>
          <span>{visibleBooks.length} 本</span>
        </header>
        <BookGrid books={visibleBooks} onOpen={handleOpenBook} />
      </section>
    </main>
  )
}
