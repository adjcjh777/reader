import type {
  BookData,
  BookMetadata,
  ChapterContent,
  TableOfContentsItem,
} from '@/types/book'
import type { BookParser } from '@/types/parser'
import { stripFileExtension, toParagraphHtml } from '@/utils/text'

export class MobiParser implements BookParser {
  private chapters: ChapterContent[] = []
  private metadata: BookMetadata = {}
  private toc: TableOfContentsItem[] = []

  async parse(file: File): Promise<BookData> {
    const rawText = await this.bestEffortDecode(file)
    const lines = rawText
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const chunkSize = 180
    this.chapters = []
    for (let index = 0; index < lines.length; index += chunkSize) {
      const chunkLines = lines.slice(index, index + chunkSize)
      this.chapters.push({
        title: `MOBI 第 ${Math.floor(index / chunkSize) + 1} 节`,
        content: toParagraphHtml(chunkLines),
        index: Math.floor(index / chunkSize),
      })
    }

    if (this.chapters.length === 0) {
      this.chapters = [
        {
          title: '正文',
          content: '<p>暂时无法解析该 MOBI 的正文内容。</p>',
          index: 0,
        },
      ]
    }

    this.toc = this.chapters.map((chapter, index) => ({
      id: `mobi-${index}`,
      label: chapter.title,
      index,
    }))

    this.metadata = {
      description:
        '当前为 MOBI 基础兼容解析版本，后续可接入更完整的二进制结构解析库。',
    }

    return {
      id: crypto.randomUUID(),
      title: stripFileExtension(file.name) || '未命名 MOBI',
      author: '未知作者',
      format: 'mobi',
      totalChapters: this.chapters.length,
      metadata: this.metadata,
      toc: this.toc,
      fileName: file.name,
      createdAt: Date.now(),
      status: 'wantToRead',
    }
  }

  async getChapter(index: number): Promise<ChapterContent> {
    const chapter = this.chapters[index]
    if (!chapter) {
      throw new Error('章节不存在')
    }

    return chapter
  }

  getMetadata(): BookMetadata {
    return this.metadata
  }

  getTOC(): TableOfContentsItem[] {
    return this.toc
  }

  getPageCount(): number {
    return this.chapters.length
  }

  private async bestEffortDecode(file: File): Promise<string> {
    const buffer = await this.readArrayBuffer(file)
    const utf8 = new TextDecoder().decode(buffer)
    const cleaned = utf8
      .split('')
      .map((character) => {
        const code = character.charCodeAt(0)
        if (code >= 32 || character === '\n' || character === '\r' || character === '\t') {
          return character
        }
        return ' '
      })
      .join('')

    if (cleaned.trim().length > 0) {
      return cleaned
    }

    return '该文件内容不可见，可能为受保护或非文本 MOBI。'
  }

  private async readArrayBuffer(file: File): Promise<ArrayBuffer> {
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
        reject(new Error('无法将文件读取为 ArrayBuffer'))
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }
}
