import ePub from 'epubjs'
import type {
  BookData,
  BookMetadata,
  ChapterContent,
  TableOfContentsItem,
} from '@/types/book'
import type { BookParser } from '@/types/parser'
import { stripFileExtension } from '@/utils/text'

type EpubNavigationItem = {
  id?: string
  href?: string
  label?: string
  subitems?: EpubNavigationItem[]
}

export class EpubParser implements BookParser {
  private book: ReturnType<typeof ePub> | null = null
  private metadata: BookMetadata = {}
  private toc: TableOfContentsItem[] = []
  private totalChapters = 0
  private sourceUrl: string | null = null

  async parse(file: File): Promise<BookData> {
    this.sourceUrl = URL.createObjectURL(file)
    this.book = ePub(this.sourceUrl)

    await this.book.ready

    const [metadata, navigation] = await Promise.all([
      this.book.loaded.metadata,
      this.book.loaded.navigation,
    ])

    this.metadata = {
      publisher: metadata.publisher,
      language: metadata.language,
      isbn: metadata.identifier,
      description: metadata.description,
      publishDate: metadata.pubdate,
    }

    this.toc = this.normalizeToc(navigation.toc ?? [])
    this.totalChapters = this.book.spine.spineItems?.length ?? this.toc.length
    if (this.totalChapters <= 0) {
      this.totalChapters = 1
    }

    return {
      id: crypto.randomUUID(),
      title: metadata.title || stripFileExtension(file.name) || '未命名 EPUB',
      author: metadata.creator || metadata.author || '未知作者',
      format: 'epub',
      totalChapters: this.totalChapters,
      metadata: this.metadata,
      toc: this.toc,
      fileName: file.name,
      source: this.sourceUrl,
      createdAt: Date.now(),
      status: 'wantToRead',
    }
  }

  async getChapter(index: number): Promise<ChapterContent> {
    if (!this.book) {
      throw new Error('EPUB 解析器尚未初始化')
    }

    const section = this.book.spine.get(index)
    if (!section) {
      throw new Error('章节不存在')
    }

    await section.load(this.book.load.bind(this.book))
    const renderedContent = await section.render(this.book.load.bind(this.book))
    section.unload()

    const fallbackTitle = `章节 ${index + 1}`
    const tocItem = this.toc[index]

    return {
      title: tocItem?.label ?? fallbackTitle,
      content: renderedContent || '<p>该章节暂无可渲染内容。</p>',
      index,
    }
  }

  getMetadata(): BookMetadata {
    return this.metadata
  }

  getTOC(): TableOfContentsItem[] {
    return this.toc
  }

  getPageCount(): number {
    return this.totalChapters
  }

  destroy(): void {
    this.book?.destroy()
    this.book = null

    if (this.sourceUrl) {
      URL.revokeObjectURL(this.sourceUrl)
      this.sourceUrl = null
    }
  }

  private normalizeToc(
    items: EpubNavigationItem[],
    depth = 0,
    startIndex = 0,
  ): TableOfContentsItem[] {
    const result: TableOfContentsItem[] = []
    let currentIndex = startIndex

    for (const item of items) {
      const normalized: TableOfContentsItem = {
        id: item.id ?? `${depth}-${currentIndex}`,
        label: item.label?.trim() || `章节 ${currentIndex + 1}`,
        href: item.href,
        index: currentIndex,
      }

      if (item.subitems && item.subitems.length > 0) {
        normalized.children = this.normalizeToc(
          item.subitems,
          depth + 1,
          currentIndex,
        )
      }

      result.push(normalized)
      currentIndex += 1
    }

    return result
  }
}
