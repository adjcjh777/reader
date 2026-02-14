import { EpubParser } from '@/services/epubParser'
import { MobiParser } from '@/services/mobiParser'
import { TxtParser } from '@/services/txtParser'
import type { BookData, BookFormat, ChapterContent } from '@/types/book'
import type { BookParser } from '@/types/parser'
import { ensureBookFormat } from '@/utils/file'

type ParserFactory = () => BookParser

class BookService {
  private readonly parserFactories: Record<BookFormat, ParserFactory> = {
    epub: () => new EpubParser(),
    mobi: () => new MobiParser(),
    txt: () => new TxtParser(),
  }

  private readonly activeParsers = new Map<string, BookParser>()

  async importBook(file: File): Promise<BookData> {
    const format = ensureBookFormat(file.name)
    const parser = this.parserFactories[format]()
    const book = await parser.parse(file)

    this.activeParsers.set(book.id, parser)
    return book
  }

  async getChapter(bookId: string, index: number): Promise<ChapterContent> {
    const parser = this.activeParsers.get(bookId)
    if (!parser) {
      throw new Error('当前书籍未加载到内存，请重新导入文件后阅读')
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
}

export const bookService = new BookService()
