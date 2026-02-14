import type {
  BookData,
  BookMetadata,
  ChapterContent,
  TableOfContentsItem,
} from '@/types/book'
import type { BookParser } from '@/types/parser'
import { stripFileExtension, toParagraphHtml } from '@/utils/text'

type RawChapter = {
  title: string
  lines: string[]
}

const CHAPTER_HEADING_PATTERNS = [
  /^第[\d零一二三四五六七八九十百千万两〇]+[章节卷回篇].*$/,
  /^chapter\s+\d+.*$/i,
  /^序章.*$/,
  /^尾声.*$/,
]

export class TxtParser implements BookParser {
  private chapters: ChapterContent[] = []
  private metadata: BookMetadata = {}
  private toc: TableOfContentsItem[] = []

  async parse(file: File): Promise<BookData> {
    const rawText = await this.readText(file)
    const normalized = rawText.replace(/\r\n/g, '\n').trim()
    const chapterBlocks = this.splitIntoChapters(normalized)

    this.chapters = chapterBlocks.map((chapter, index) => ({
      title: chapter.title,
      content: toParagraphHtml(chapter.lines),
      index,
    }))

    this.toc = this.chapters.map((chapter, index) => ({
      id: `txt-${index}`,
      label: chapter.title,
      index,
    }))

    this.metadata = {
      language: 'zh-CN',
      description: `由 TXT 解析生成，共 ${this.chapters.length} 章`,
    }

    return {
      id: crypto.randomUUID(),
      title: stripFileExtension(file.name) || '未命名 TXT',
      author: '未知作者',
      format: 'txt',
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

  private async readText(file: File): Promise<string> {
    const buffer = await this.readArrayBuffer(file)
    const encodings = ['utf-8', 'utf-16le', 'gb18030', 'big5']

    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: true })
        return decoder.decode(buffer)
      } catch {
        continue
      }
    }

    return new TextDecoder().decode(buffer)
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

  private splitIntoChapters(content: string): RawChapter[] {
    const lines = content.split('\n')
    const chapters: RawChapter[] = []
    let currentChapter: RawChapter = {
      title: '开始阅读',
      lines: [],
    }

    for (const line of lines) {
      const trimmed = line.trim()
      const isHeading =
        trimmed.length > 0 &&
        CHAPTER_HEADING_PATTERNS.some((pattern) => pattern.test(trimmed))

      if (isHeading) {
        if (currentChapter.lines.length > 0) {
          chapters.push(currentChapter)
        }

        currentChapter = {
          title: trimmed,
          lines: [],
        }
      } else {
        currentChapter.lines.push(line)
      }
    }

    if (currentChapter.lines.length > 0) {
      chapters.push(currentChapter)
    }

    if (chapters.length <= 1) {
      return this.splitByChunk(lines)
    }

    return chapters
  }

  private splitByChunk(lines: string[]): RawChapter[] {
    const chunkSize = 120
    const chunks: RawChapter[] = []

    for (let index = 0; index < lines.length; index += chunkSize) {
      const chunkLines = lines.slice(index, index + chunkSize)
      chunks.push({
        title: `第 ${Math.floor(index / chunkSize) + 1} 节`,
        lines: chunkLines,
      })
    }

    return chunks.length > 0
      ? chunks
      : [
          {
            title: '正文',
            lines,
          },
        ]
  }
}
