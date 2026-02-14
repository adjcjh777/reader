import { storageService } from '@/services/storageService'
import type { BookData, BookFormat, ChapterContent } from '@/types/book'
import type { BookParser } from '@/types/parser'
import { withTimeout } from '@/utils/async'
import { ensureBookFormat } from '@/utils/file'

const PARSE_TIMEOUT_MS = 22_000
const CHAPTER_TIMEOUT_MS = 16_000

class BookService {
  private readonly activeParsers = new Map<string, BookParser>()

  async importBook(file: File): Promise<BookData> {
    const format = ensureBookFormat(file.name)
    const parser = await this.createParser(format)

    let book: BookData
    try {
      book = await withTimeout(
        parser.parse(file),
        PARSE_TIMEOUT_MS,
        `${file.name} 解析超时，请尝试换一个 EPUB 文件或重新导出。`,
      )
    } catch (error) {
      parser.destroy?.()
      throw error
    }

    this.activeParsers.set(book.id, parser)
    return book
  }

  async ensureBookReady(book: BookData): Promise<BookData> {
    if (this.activeParsers.has(book.id)) {
      return book
    }

    const persistedFile = await storageService.loadBookFile(book.id)
    if (!persistedFile) {
      throw new Error('未找到该书籍原始文件，请重新导入后阅读')
    }

    const file = new File([persistedFile.buffer], persistedFile.name, {
      type: persistedFile.type,
      lastModified: persistedFile.lastModified,
    })

    const parser = await this.createParser(book.format)

    let parsedBook: BookData
    try {
      parsedBook = await withTimeout(
        parser.parse(file),
        PARSE_TIMEOUT_MS,
        `${book.fileName} 恢复解析超时，请重新导入该书籍。`,
      )
    } catch (error) {
      parser.destroy?.()
      throw error
    }

    this.activeParsers.set(book.id, parser)

    return {
      ...book,
      totalChapters: parsedBook.totalChapters,
      toc: parsedBook.toc,
      metadata: {
        ...book.metadata,
        ...parsedBook.metadata,
      },
      cover: book.cover ?? parsedBook.cover,
    }
  }

  async getChapter(bookId: string, index: number): Promise<ChapterContent> {
    const parser = this.activeParsers.get(bookId)
    if (!parser) {
      throw new Error('当前书籍尚未加载，请先完成书籍恢复')
    }

    return withTimeout(
      parser.getChapter(index),
      CHAPTER_TIMEOUT_MS,
      '章节加载超时，请切换章节后重试。',
    )
  }

  getPageCount(bookId: string): number {
    const parser = this.activeParsers.get(bookId)
    return parser?.getPageCount() ?? 0
  }

  releaseBook(bookId: string): void {
    const parser = this.activeParsers.get(bookId)
    parser?.destroy?.()
    this.activeParsers.delete(bookId)
  }

  releaseAll(): void {
    for (const [bookId, parser] of this.activeParsers.entries()) {
      parser.destroy?.()
      this.activeParsers.delete(bookId)
    }
  }

  private async createParser(format: BookFormat): Promise<BookParser> {
    if (format === 'epub') {
      const module = await import('@/services/epubParser')
      return new module.EpubParser()
    }

    if (format === 'mobi') {
      const module = await import('@/services/mobiParser')
      return new module.MobiParser()
    }

    const module = await import('@/services/txtParser')
    return new module.TxtParser()
  }
}

export const bookService = new BookService()
