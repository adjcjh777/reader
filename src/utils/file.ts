import type { BookFormat } from '@/types/book'

const SUPPORTED_EXTENSIONS: Record<string, BookFormat> = {
  epub: 'epub',
  mobi: 'mobi',
  txt: 'txt',
}

export function detectBookFormat(fileName: string): BookFormat | null {
  const matched = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)
  if (!matched) {
    return null
  }

  return SUPPORTED_EXTENSIONS[matched[1]] ?? null
}

export function ensureBookFormat(fileName: string): BookFormat {
  const format = detectBookFormat(fileName)
  if (!format) {
    throw new Error('不支持的文件格式，仅支持 EPUB / MOBI / TXT')
  }

  return format
}
