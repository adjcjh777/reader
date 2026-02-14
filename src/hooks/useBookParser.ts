import { useMemo, useState } from 'react'
import { bookService } from '@/services/bookService'
import { storageService } from '@/services/storageService'
import { useLibraryStore } from '@/store/libraryStore'
import type { BookData } from '@/types/book'

interface BookParserState {
  isParsing: boolean
  error: string | null
}

interface UseBookParserReturn extends BookParserState {
  importFiles: (fileList: FileList | File[]) => Promise<BookData[]>
}

export function useBookParser(): UseBookParserReturn {
  const addBook = useLibraryStore((state) => state.addBook)
  const setBooks = useLibraryStore((state) => state.setBooks)
  const [state, setState] = useState<BookParserState>({
    isParsing: false,
    error: null,
  })

  const importFiles = useMemo(
    () =>
      async (fileList: FileList | File[]): Promise<BookData[]> => {
        const files = Array.from(fileList)
        if (files.length === 0) {
          return []
        }

        setState({ isParsing: true, error: null })
        const imported: BookData[] = []

        try {
          for (const file of files) {
            const book = await bookService.importBook(file)
            addBook(book)
            imported.push(book)
          }

          await storageService.saveLibrary(useLibraryStore.getState().books)
          return imported
        } catch (error) {
          const message =
            error instanceof Error ? error.message : '导入文件时发生未知错误'
          setState({ isParsing: false, error: message })
          throw error
        } finally {
          setBooks([...useLibraryStore.getState().books])
          setState((previous) => ({
            ...previous,
            isParsing: false,
          }))
        }
      },
    [addBook, setBooks],
  )

  return {
    ...state,
    importFiles,
  }
}
