import { describe, expect, it } from 'vitest'
import { bookService } from '@/services/bookService'
import type { BookData } from '@/types/book'

const dummyBook: BookData = {
  id: 'not-exist',
  title: '测试书籍',
  author: '测试作者',
  format: 'txt',
  totalChapters: 1,
  metadata: {},
  toc: [],
  fileName: 'demo.txt',
  createdAt: Date.now(),
  status: 'wantToRead',
}

describe('bookService', () => {
  it('无持久化原始文件时会提示重新导入', async () => {
    await expect(bookService.ensureBookReady(dummyBook)).rejects.toThrow(
      '未找到该书籍原始文件，请重新导入后阅读',
    )
  })
})
