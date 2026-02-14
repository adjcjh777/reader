import { useEffect } from 'react'
import { storageService } from '@/services/storageService'
import { useReaderStore } from '@/store/readerStore'

export function useReadingProgress(bookId: string | null): void {
  const currentChapter = useReaderStore((state) => state.currentChapter)
  const currentPage = useReaderStore((state) => state.currentPage)
  const setCurrentChapter = useReaderStore((state) => state.setCurrentChapter)
  const setCurrentPage = useReaderStore((state) => state.setCurrentPage)

  useEffect(() => {
    if (!bookId) {
      return
    }

    let active = true

    void storageService.loadReadingProgress(bookId).then((progress) => {
      if (!active || !progress) {
        return
      }

      setCurrentChapter(progress.chapterIndex)
      setCurrentPage(progress.page)
    })

    return () => {
      active = false
    }
  }, [bookId, setCurrentChapter, setCurrentPage])

  useEffect(() => {
    if (!bookId) {
      return
    }

    void storageService.saveReadingProgress({
      bookId,
      chapterIndex: currentChapter,
      page: currentPage,
      percentage: 0,
      updatedAt: Date.now(),
    })
  }, [bookId, currentChapter, currentPage])
}
