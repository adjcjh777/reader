import { create } from 'zustand'
import type { BookData, BookStatus } from '@/types/book'

export type LibraryViewMode = 'grid' | 'list'
export type LibrarySortBy = 'title' | 'author' | 'recent'
export type LibraryFilter = 'all' | BookStatus

interface LibraryStore {
  books: BookData[]
  currentBookId: string | null
  viewMode: LibraryViewMode
  sortBy: LibrarySortBy
  filter: LibraryFilter
  setBooks: (books: BookData[]) => void
  addBook: (book: BookData) => void
  replaceBook: (book: BookData) => void
  removeBook: (bookId: string) => void
  setCurrentBook: (bookId: string | null) => void
  setViewMode: (mode: LibraryViewMode) => void
  setSortBy: (sortBy: LibrarySortBy) => void
  setFilter: (filter: LibraryFilter) => void
  markBookStatus: (bookId: string, status: BookStatus) => void
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  books: [],
  currentBookId: null,
  viewMode: 'grid',
  sortBy: 'recent',
  filter: 'all',
  setBooks: (books) => set({ books }),
  addBook: (book) =>
    set((state) => ({
      books: [book, ...state.books.filter((item) => item.id !== book.id)],
      currentBookId: state.currentBookId ?? book.id,
    })),
  replaceBook: (book) =>
    set((state) => ({
      books: state.books.map((item) => (item.id === book.id ? book : item)),
    })),
  removeBook: (bookId) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== bookId),
      currentBookId:
        state.currentBookId === bookId ? null : state.currentBookId,
    })),
  setCurrentBook: (currentBookId) => set({ currentBookId }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilter: (filter) => set({ filter }),
  markBookStatus: (bookId, status) =>
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId ? { ...book, status, lastReadAt: Date.now() } : book,
      ),
    })),
}))
