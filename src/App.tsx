import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useReaderPreferences } from '@/hooks/useReaderPreferences'
import { storageService } from '@/services/storageService'
import { useLibraryStore } from '@/store/libraryStore'
import { useReaderStore } from '@/store/readerStore'

const LibraryPage = lazy(() =>
  import('@/features/library/LibraryPage').then((module) => ({
    default: module.LibraryPage,
  })),
)

const ReaderPage = lazy(() =>
  import('@/features/reader/ReaderPage').then((module) => ({
    default: module.ReaderPage,
  })),
)

function App() {
  const books = useLibraryStore((state) => state.books)
  const setBooks = useLibraryStore((state) => state.setBooks)
  const theme = useReaderStore((state) => state.theme)
  const [libraryHydrated, setLibraryHydrated] = useState(false)

  useReaderPreferences()

  useEffect(() => {
    let active = true

    void storageService.loadLibrary().then((loadedBooks) => {
      if (!active) {
        return
      }
      setBooks(loadedBooks)
      setLibraryHydrated(true)
    })

    return () => {
      active = false
    }
  }, [setBooks])

  useEffect(() => {
    if (!libraryHydrated) {
      return
    }

    void storageService.saveLibrary(books)
  }, [books, libraryHydrated])

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  return (
    <div className="app-shell">
      <Suspense fallback={<main className="library-page">正在加载页面...</main>}>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/reader/:bookId" element={<ReaderPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
