import { describe, expect, it } from 'vitest'
import { filterAndSortBooks } from '@/store/selectors'
import type { BookData } from '@/types/book'

const createBook = (overrides: Partial<BookData>): BookData => ({
  id: crypto.randomUUID(),
  title: '默认标题',
  author: '默认作者',
  format: 'txt',
  totalChapters: 1,
  metadata: {},
  toc: [],
  fileName: 'test.txt',
  createdAt: Date.now(),
  status: 'wantToRead',
  ...overrides,
})

describe('filterAndSortBooks', () => {
  it('按状态过滤', () => {
    const books = [
      createBook({ title: 'A', status: 'reading' }),
      createBook({ title: 'B', status: 'finished' }),
      createBook({ title: 'C', status: 'wantToRead' }),
    ]

    const result = filterAndSortBooks(books, 'reading', 'recent')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('A')
  })

  it('按标题排序', () => {
    const books = [
      createBook({ title: '张三传' }),
      createBook({ title: '阿尔法' }),
      createBook({ title: '北京故事' }),
    ]

    const result = filterAndSortBooks(books, 'all', 'title')
    expect(result.map((book) => book.title)).toEqual([
      '阿尔法',
      '北京故事',
      '张三传',
    ])
  })
})
