export type BookFormat = 'epub' | 'mobi' | 'txt'

export type BookStatus = 'reading' | 'wantToRead' | 'finished'

export interface BookMetadata {
  publisher?: string
  language?: string
  isbn?: string
  description?: string
  publishDate?: string
}

export interface TableOfContentsItem {
  id: string
  label: string
  href?: string
  index: number
  children?: TableOfContentsItem[]
}

export interface ChapterContent {
  title: string
  content: string
  index: number
}

export interface BookData {
  id: string
  title: string
  author: string
  cover?: string
  format: BookFormat
  totalChapters: number
  metadata: BookMetadata
  toc: TableOfContentsItem[]
  fileName: string
  source?: string
  createdAt: number
  lastReadAt?: number
  status: BookStatus
}

export interface Bookmark {
  id: string
  bookId: string
  chapterIndex: number
  title: string
  excerpt: string
  createdAt: number
}

export interface ReadingProgress {
  bookId: string
  chapterIndex: number
  page: number
  percentage: number
  updatedAt: number
}
