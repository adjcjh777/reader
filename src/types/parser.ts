import type {
  BookData,
  BookMetadata,
  ChapterContent,
  TableOfContentsItem,
} from '@/types/book'

export interface BookParser {
  parse(file: File): Promise<BookData>
  getChapter(index: number): Promise<ChapterContent>
  getMetadata(): BookMetadata
  getTOC(): TableOfContentsItem[]
  getPageCount(): number
  destroy?(): void
}
