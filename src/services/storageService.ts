import { del, get, set } from 'idb-keyval'
import type { BookData, ReadingProgress } from '@/types/book'

const KEYS = {
  LIBRARY: 'reader:library',
  READER_PREFS: 'reader:reader-prefs',
} as const

const progressKey = (bookId: string) => `reader:progress:${bookId}`
const fileKey = (bookId: string) => `reader:file:${bookId}`

export interface ReaderPreferences {
  fontSize: number
  fontFamily: string
  lineHeight: number
  pageWidth: number
  theme: 'light' | 'dark' | 'sepia'
}

export interface PersistedBookFile {
  bookId: string
  name: string
  type: string
  lastModified: number
  buffer: ArrayBuffer
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

  async saveBookFile(bookId: string, file: File): Promise<void> {
    const payload: PersistedBookFile = {
      bookId,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      buffer: await readFileAsArrayBuffer(file),
    }

    await set(fileKey(bookId), payload)
  },

  async loadBookFile(bookId: string): Promise<PersistedBookFile | null> {
    return (await get<PersistedBookFile>(fileKey(bookId))) ?? null
  },

  async clearBookFile(bookId: string): Promise<void> {
    await del(fileKey(bookId))
  },
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer()
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
        return
      }
      reject(new Error('无法读取文件内容'))
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}
