import {
  initMobiFile,
  type Mobi,
  type MobiTocItem,
} from '@lingo-reader/mobi-parser'
import type {
  BookData,
  BookMetadata,
  ChapterContent,
  TableOfContentsItem,
} from '@/types/book'
import type { BookParser } from '@/types/parser'
import { stripFileExtension } from '@/utils/text'

type MobiSpineItem = {
  id: string
}

export class MobiParser implements BookParser {
  private mobi: Mobi | null = null
  private metadata: BookMetadata = {}
  private toc: TableOfContentsItem[] = []
  private spine: MobiSpineItem[] = []

  async parse(file: File): Promise<BookData> {
    this.mobi = await initMobiFile(file)

    const rawMetadata = this.mobi.getMetadata()
    this.spine = this.mobi.getSpine()
    this.toc = this.normalizeToc(this.mobi.getToc())

    this.metadata = {
      publisher: rawMetadata.publisher,
      language: rawMetadata.language,
      isbn: rawMetadata.identifier,
      description: rawMetadata.description,
      publishDate: rawMetadata.published,
    }

    const author = rawMetadata.author?.join('、') || '未知作者'
    const cover = this.mobi.getCoverImage() || undefined

    return {
      id: crypto.randomUUID(),
      title: rawMetadata.title || stripFileExtension(file.name) || '未命名 MOBI',
      author,
      cover,
      format: 'mobi',
      totalChapters: this.spine.length || this.toc.length || 1,
      metadata: this.metadata,
      toc: this.toc,
      fileName: file.name,
      createdAt: Date.now(),
      status: 'wantToRead',
    }
  }

  async getChapter(index: number): Promise<ChapterContent> {
    if (!this.mobi) {
      throw new Error('MOBI 解析器尚未初始化')
    }

    const chapter = this.spine[index]
    if (!chapter) {
      throw new Error('章节不存在')
    }

    const processed = this.mobi.loadChapter(chapter.id)
    if (!processed) {
      throw new Error('章节内容为空')
    }

    const title = this.toc[index]?.label ?? `章节 ${index + 1}`

    return {
      title,
      content: processed.html,
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
    return this.spine.length || this.toc.length
  }

  destroy(): void {
    this.mobi?.destroy()
    this.mobi = null
  }

  private normalizeToc(
    items: MobiTocItem[],
    depth = 0,
    cursor = { value: 0 },
  ): TableOfContentsItem[] {
    return items.map((item) => {
      const resolved = item.href && this.mobi ? this.mobi.resolveHref(item.href) : undefined
      const linkedIndex = resolved
        ? this.spine.findIndex((chapter) => chapter.id === resolved.id)
        : -1

      const index = linkedIndex >= 0 ? linkedIndex : cursor.value
      cursor.value += 1

      return {
        id: `${depth}-${index}-${item.label}`,
        label: item.label || `章节 ${index + 1}`,
        href: item.href,
        index,
        children: item.children
          ? this.normalizeToc(item.children, depth + 1, cursor)
          : undefined,
      }
    })
  }
}
