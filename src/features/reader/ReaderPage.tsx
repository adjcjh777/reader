import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { PageTurner } from '@/features/reader/PageTurner'
import { ProgressBar } from '@/features/reader/ProgressBar'
import { ReaderToolbar } from '@/features/reader/ReaderToolbar'
import { SettingsPanel } from '@/features/settings/SettingsPanel'
import { BookmarkList } from '@/features/toc/BookmarkList'
import { TableOfContents } from '@/features/toc/TableOfContents'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { bookService } from '@/services/bookService'
import { storageService } from '@/services/storageService'
import { useLibraryStore } from '@/store/libraryStore'
import { useReaderStore } from '@/store/readerStore'
import type { ChapterContent } from '@/types/book'

export function ReaderPage() {
  const navigate = useNavigate()
  const { bookId } = useParams<{ bookId: string }>()

  const books = useLibraryStore((state) => state.books)
  const setCurrentBook = useLibraryStore((state) => state.setCurrentBook)
  const markBookStatus = useLibraryStore((state) => state.markBookStatus)
  const replaceBook = useLibraryStore((state) => state.replaceBook)

  const currentChapterIndex = useReaderStore((state) => state.currentChapter)
  const setCurrentChapter = useReaderStore((state) => state.setCurrentChapter)
  const resetReaderPosition = useReaderStore((state) => state.resetReaderPosition)
  const fontSize = useReaderStore((state) => state.fontSize)
  const fontFamily = useReaderStore((state) => state.fontFamily)
  const lineHeight = useReaderStore((state) => state.lineHeight)
  const pageWidth = useReaderStore((state) => state.pageWidth)
  const bookmarks = useReaderStore((state) => state.bookmarks)
  const addBookmark = useReaderStore((state) => state.addBookmark)
  const removeBookmark = useReaderStore((state) => state.removeBookmark)

  const [chapter, setChapter] = useState<ChapterContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')

  const book = useMemo(
    () => books.find((item) => item.id === bookId) ?? null,
    [bookId, books],
  )

  const bookBookmarks = useMemo(
    () => bookmarks.filter((bookmark) => bookmark.bookId === bookId),
    [bookId, bookmarks],
  )

  const searchResults = useMemo(() => {
    if (!searchKeyword.trim() || !chapter) {
      return []
    }

    const normalizedKeyword = searchKeyword.trim().toLowerCase()
    const plain = chapter.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
    const words = plain.split(' ').filter(Boolean)
    const snippets: string[] = []

    for (let index = 0; index < words.length; index += 1) {
      if (!words[index].toLowerCase().includes(normalizedKeyword)) {
        continue
      }

      const start = Math.max(0, index - 8)
      const end = Math.min(words.length, index + 9)
      snippets.push(words.slice(start, end).join(' '))

      if (snippets.length >= 8) {
        break
      }
    }

    return snippets
  }, [chapter, searchKeyword])

  useReadingProgress(book?.id ?? null)

  useEffect(() => {
    if (!book) {
      return
    }

    setCurrentBook(book.id)
    markBookStatus(book.id, 'reading')
  }, [book, markBookStatus, setCurrentBook])

  useEffect(() => {
    if (!book) {
      return
    }

    const maxChapterIndex = Math.max(book.totalChapters - 1, 0)
    if (currentChapterIndex > maxChapterIndex) {
      setCurrentChapter(maxChapterIndex)
      return
    }

    let active = true

    const loadChapter = async () => {
      setLoading(true)
      setError(null)

      try {
        const hydratedBook = await bookService.ensureBookReady(book)
        if (!active) {
          return
        }

        if (
          hydratedBook.totalChapters !== book.totalChapters ||
          hydratedBook.toc.length !== book.toc.length
        ) {
          replaceBook(hydratedBook)
          const updatedBooks = useLibraryStore
            .getState()
            .books.map((item) => (item.id === hydratedBook.id ? hydratedBook : item))
          await storageService.saveLibrary(updatedBooks)
        }

        const value = await bookService.getChapter(book.id, currentChapterIndex)
        if (!active) {
          return
        }

        setChapter(value)
      } catch (chapterError) {
        if (!active) {
          return
        }
        const message =
          chapterError instanceof Error
            ? chapterError.message
            : '章节加载失败，请重试'
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadChapter()

    return () => {
      active = false
    }
  }, [book, currentChapterIndex, replaceBook, setCurrentChapter])

  useEffect(() => {
    return () => {
      if (!bookId) {
        return
      }
      bookService.releaseBook(bookId)
    }
  }, [bookId])

  if (!book) {
    return (
      <main className="reader-page">
        <div className="empty-state">
          <h3>未找到书籍</h3>
          <p>请返回书库重新导入文件。</p>
          <button
            className="ui-button ui-button--primary"
            onClick={() => navigate('/')}
            type="button"
          >
            返回书库
          </button>
        </div>
      </main>
    )
  }

  const canPrev = currentChapterIndex > 0
  const canNext = currentChapterIndex < book.totalChapters - 1

  const addCurrentBookmark = () => {
    addBookmark({
      id: crypto.randomUUID(),
      bookId: book.id,
      chapterIndex: currentChapterIndex,
      title: chapter?.title || `第 ${currentChapterIndex + 1} 章`,
      excerpt: getExcerpt(chapter?.content),
      createdAt: Date.now(),
    })
  }

  return (
    <main className="reader-page">
      <ReaderToolbar
        title={book.title}
        onBack={() => {
          resetReaderPosition()
          navigate('/')
        }}
        onToggleSettings={() => setSettingsOpen(true)}
        onToggleToc={() => setTocOpen((visible) => !visible)}
        onAddBookmark={addCurrentBookmark}
      />

      <section className="reader-search">
        <input
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
          placeholder="搜索当前章节内容"
        />
        {searchKeyword && (
          <span className="reader-search__count">匹配 {searchResults.length} 条</span>
        )}
      </section>

      {searchResults.length > 0 && (
        <section className="reader-search-result fade-in">
          {searchResults.map((snippet, index) => (
            <p key={`${snippet}-${index}`}>{snippet}</p>
          ))}
        </section>
      )}

      <article
        className="reader-content page-transition"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          lineHeight,
          maxWidth: `${pageWidth}px`,
        }}
      >
        {loading && <p>章节加载中...</p>}
        {error && <p className="status-text status-text--error">{error}</p>}

        <AnimatePresence mode="wait">
          {!loading && !error && chapter && (
            <motion.section
              key={`${book.id}-${currentChapterIndex}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <h3>{chapter.title}</h3>
              <div
                className="chapter-html"
                dangerouslySetInnerHTML={{ __html: chapter.content }}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </article>

      <PageTurner
        canPrev={canPrev}
        canNext={canNext}
        onPrev={() => setCurrentChapter(currentChapterIndex - 1)}
        onNext={() => setCurrentChapter(currentChapterIndex + 1)}
      />

      <ProgressBar value={currentChapterIndex + 1} max={book.totalChapters} />

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Modal open={tocOpen} onClose={() => setTocOpen(false)} title="目录与书签">
        <TableOfContents
          items={book.toc}
          activeIndex={currentChapterIndex}
          onSelect={(index) => {
            setCurrentChapter(index)
            setTocOpen(false)
          }}
        />
        <BookmarkList
          bookmarks={bookBookmarks}
          onSelect={(bookmark) => {
            setCurrentChapter(bookmark.chapterIndex)
            setTocOpen(false)
          }}
          onRemove={removeBookmark}
        />
      </Modal>
    </main>
  )
}

function getExcerpt(content?: string): string {
  if (!content) {
    return '无摘录'
  }

  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.slice(0, 80) || '无摘录'
}
