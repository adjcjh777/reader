import ePub from 'epubjs'
import type {
  BookData,
  BookMetadata,
  ChapterContent,
  TableOfContentsItem,
} from '@/types/book'
import type { BookParser } from '@/types/parser'
import { withTimeout } from '@/utils/async'
import { stripFileExtension } from '@/utils/text'

type EpubNavigationItem = {
  id?: string
  href?: string
  label?: string
  subitems?: EpubNavigationItem[]
}

type EpubMetadataLike = {
  publisher?: string
  language?: string
  identifier?: string
  description?: string
  pubdate?: string
  title?: string
  creator?: string
  author?: string
}

const EPUB_READY_TIMEOUT = 18_000
const EPUB_META_TIMEOUT = 12_000
const EPUB_CHAPTER_TIMEOUT = 15_000

export class EpubParser implements BookParser {
  private book: ReturnType<typeof ePub> | null = null
  private metadata: BookMetadata = {}
  private toc: TableOfContentsItem[] = []
  private totalChapters = 0

  async parse(file: File): Promise<BookData> {
    const buffer = await readFileAsArrayBuffer(file)
    this.book = ePub(buffer)

    await withTimeout(
      this.book.ready,
      EPUB_READY_TIMEOUT,
      'EPUB 初始化超时，请检查文件是否完整或尝试重新导入。',
    )

    const metadata = await withTimeout(
      this.book.loaded.metadata,
      EPUB_META_TIMEOUT,
      'EPUB 元数据读取超时。',
    ).catch(() => ({}) as EpubMetadataLike)

    const navigation = await withTimeout(
      this.book.loaded.navigation,
      EPUB_META_TIMEOUT,
      'EPUB 目录读取超时。',
    ).catch(() => ({ toc: [] as EpubNavigationItem[] }))

    this.metadata = {
      publisher: metadata.publisher,
      language: metadata.language,
      isbn: metadata.identifier,
      description: metadata.description,
      publishDate: metadata.pubdate,
    }

    this.totalChapters = this.book.spine.spineItems?.length ?? 0
    this.toc = this.normalizeToc(navigation.toc ?? [], this.totalChapters)

    if (this.totalChapters <= 0) {
      this.totalChapters = this.toc.length
    }

    if (this.totalChapters <= 0) {
      this.totalChapters = 1
    }

    if (this.toc.length === 0) {
      this.toc = Array.from({ length: this.totalChapters }, (_, index) => ({
        id: `chapter-${index}`,
        label: `第 ${index + 1} 章`,
        index,
      }))
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

    await withTimeout(
      section.load(this.book.load.bind(this.book)),
      EPUB_CHAPTER_TIMEOUT,
      '章节资源加载超时。',
    )

    const renderedContent = await withTimeout(
      section.render(this.book.load.bind(this.book)),
      EPUB_CHAPTER_TIMEOUT,
      '章节渲染超时。',
    )

    section.unload()

    const fallbackTitle = `第 ${index + 1} 章`
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
  }

  private normalizeToc(
    items: EpubNavigationItem[],
    chapterCount: number,
  ): TableOfContentsItem[] {
    const result: TableOfContentsItem[] = []
    const stack = [...items]
    let fallbackIndex = 0

    while (stack.length > 0) {
      const item = stack.shift()
      if (!item) {
        continue
      }

      result.push({
        id: item.id ?? `toc-${fallbackIndex}`,
        label: item.label?.trim() || `第 ${fallbackIndex + 1} 章`,
        href: item.href,
        index: Math.min(fallbackIndex, Math.max(chapterCount - 1, 0)),
      })

      fallbackIndex += 1

      if (item.subitems?.length) {
        stack.unshift(...item.subitems)
      }
    }

    return result
  }
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer()
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
        return
      }

      reject(new Error('无法读取 EPUB 文件'))
    }
    reader.onerror = () => reject(new Error('读取 EPUB 文件失败'))
    reader.readAsArrayBuffer(file)
  })
}
