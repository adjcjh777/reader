import { create } from 'zustand'
import type { Bookmark } from '@/types/book'

export type ReaderTheme = 'light' | 'dark' | 'sepia'

interface ReaderStore {
  currentChapter: number
  currentPage: number
  fontSize: number
  fontFamily: string
  theme: ReaderTheme
  lineHeight: number
  pageWidth: number
  bookmarks: Bookmark[]
  isToolbarVisible: boolean
  setCurrentChapter: (chapter: number) => void
  setCurrentPage: (page: number) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setTheme: (theme: ReaderTheme) => void
  setLineHeight: (lineHeight: number) => void
  setPageWidth: (pageWidth: number) => void
  addBookmark: (bookmark: Bookmark) => void
  removeBookmark: (bookmarkId: string) => void
  toggleToolbar: () => void
  setToolbarVisible: (visible: boolean) => void
  hydratePreferences: (prefs: {
    fontSize: number
    fontFamily: string
    lineHeight: number
    pageWidth: number
    theme: ReaderTheme
  }) => void
  resetReaderPosition: () => void
}

export const useReaderStore = create<ReaderStore>((set) => ({
  currentChapter: 0,
  currentPage: 0,
  fontSize: 18,
  fontFamily: 'PingFang SC, SF Pro Text, -apple-system, sans-serif',
  theme: 'light',
  lineHeight: 1.9,
  pageWidth: 760,
  bookmarks: [],
  isToolbarVisible: true,
  setCurrentChapter: (currentChapter) => set({ currentChapter }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setFontSize: (fontSize) => set({ fontSize }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setTheme: (theme) => set({ theme }),
  setLineHeight: (lineHeight) => set({ lineHeight }),
  setPageWidth: (pageWidth) => set({ pageWidth }),
  addBookmark: (bookmark) =>
    set((state) => ({
      bookmarks: [bookmark, ...state.bookmarks],
    })),
  removeBookmark: (bookmarkId) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
    })),
  toggleToolbar: () =>
    set((state) => ({
      isToolbarVisible: !state.isToolbarVisible,
    })),
  setToolbarVisible: (isToolbarVisible) => set({ isToolbarVisible }),
  hydratePreferences: (prefs) =>
    set({
      fontSize: prefs.fontSize,
      fontFamily: prefs.fontFamily,
      lineHeight: prefs.lineHeight,
      pageWidth: prefs.pageWidth,
      theme: prefs.theme,
    }),
  resetReaderPosition: () =>
    set({
      currentChapter: 0,
      currentPage: 0,
    }),
}))
