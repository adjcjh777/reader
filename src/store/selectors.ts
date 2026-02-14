import type { BookData } from '@/types/book'
import type { LibraryFilter, LibrarySortBy } from '@/store/libraryStore'

export function filterAndSortBooks(
  books: BookData[],
  filter: LibraryFilter,
  sortBy: LibrarySortBy,
): BookData[] {
  const filtered =
    filter === 'all' ? books : books.filter((book) => book.status === filter)

  return [...filtered].sort((left, right) => {
    if (sortBy === 'title') {
      return left.title.localeCompare(right.title, 'zh-Hans-CN')
    }

    if (sortBy === 'author') {
      return left.author.localeCompare(right.author, 'zh-Hans-CN')
    }

    return (right.lastReadAt ?? right.createdAt) - (left.lastReadAt ?? left.createdAt)
  })
}
