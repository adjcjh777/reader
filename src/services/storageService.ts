import { del, get, set } from 'idb-keyval'
import type { BookData, ReadingProgress } from '@/types/book'

const KEYS = {
  LIBRARY: 'reader:library',
  READER_PREFS: 'reader:reader-prefs',
} as const

const progressKey = (bookId: string) => `reader:progress:${bookId}`

export interface ReaderPreferences {
  fontSize: number
  fontFamily: string
  lineHeight: number
  pageWidth: number
  theme: 'light' | 'dark' | 'sepia'
}

export const storageService = {
  async saveLibrary(books: BookData[]): Promise<void> {
    await set(KEYS.LIBRARY, books)
  },

  async loadLibrary(): Promise<BookData[]> {
    return (await get<BookData[]>(KEYS.LIBRARY)) ?? []
  },

  async saveReaderPreferences(prefs: ReaderPreferences): Promise<void> {
    await set(KEYS.READER_PREFS, prefs)
  },

  async loadReaderPreferences(): Promise<ReaderPreferences | null> {
    return (await get<ReaderPreferences>(KEYS.READER_PREFS)) ?? null
  },

  async saveReadingProgress(progress: ReadingProgress): Promise<void> {
    await set(progressKey(progress.bookId), progress)
  },

  async loadReadingProgress(bookId: string): Promise<ReadingProgress | null> {
    return (await get<ReadingProgress>(progressKey(bookId))) ?? null
  },

  async clearReadingProgress(bookId: string): Promise<void> {
    await del(progressKey(bookId))
  },
}
