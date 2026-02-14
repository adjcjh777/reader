import { describe, expect, it } from 'vitest'
import { storageService } from '@/services/storageService'

describe('storageService', () => {
  it('可保存并读取书籍原始文件', async () => {
    const file = new File(['hello world'], 'sample.txt', {
      type: 'text/plain',
      lastModified: 123,
    })

    await storageService.saveBookFile('book-1', file)
    const saved = await storageService.loadBookFile('book-1')

    expect(saved).not.toBeNull()
    expect(saved?.name).toBe('sample.txt')
    expect(saved?.type).toBe('text/plain')
    expect(saved?.lastModified).toBe(123)

    await storageService.clearBookFile('book-1')
  })
})
