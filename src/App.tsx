import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LibraryPage } from '@/features/library/LibraryPage'
import { ReaderPage } from '@/features/reader/ReaderPage'
import { useReaderPreferences } from '@/hooks/useReaderPreferences'
import { storageService } from '@/services/storageService'
import { useLibraryStore } from '@/store/libraryStore'
import { useReaderStore } from '@/store/readerStore'

function App() {
  const setBooks = useLibraryStore((state) => state.setBooks)
  const theme = useReaderStore((state) => state.theme)

  useReaderPreferences()

  useEffect(() => {
    let active = true

    void storageService.loadLibrary().then((books) => {
      if (!active) {
        return
      }
      setBooks(books)
    })

    return () => {
      active = false
    }
  }, [setBooks])

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/reader/:bookId" element={<ReaderPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </div>
  )
}

export default App
