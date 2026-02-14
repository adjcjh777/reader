import { storageService } from '@/services/storageService'
import type { BookData, BookFormat, ChapterContent } from '@/types/book'
import type { BookParser } from '@/types/parser'
import { ensureBookFormat } from '@/utils/file'

class BookService {
  private readonly activeParsers = new Map<string, BookParser>()

  async importBook(file: File): Promise<BookData> {
    const format = ensureBookFormat(file.name)
    const parser = await this.createParser(format)
    const book = await parser.parse(file)

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
    const parsedBook = await parser.parse(file)

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

    return parser.getChapter(index)
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
