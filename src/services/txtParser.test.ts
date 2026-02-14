import { describe, expect, it } from 'vitest'
import { TxtParser } from '@/services/txtParser'

describe('TxtParser', () => {
  it('识别章节并返回目录', async () => {
    const parser = new TxtParser()
    const file = new File(
      [
        [
          '第1章 开始',
          '这是第一章内容',
          '这是第一章第二段',
          '第2章 继续',
          '这是第二章内容',
        ].join('\n'),
      ],
      'demo.txt',
      { type: 'text/plain' },
    )

    const book = await parser.parse(file)

    expect(book.format).toBe('txt')
    expect(book.totalChapters).toBe(2)
    expect(book.toc).toHaveLength(2)
    expect(book.toc[0].label).toContain('第1章')

    const chapter = await parser.getChapter(1)
    expect(chapter.title).toContain('第2章')
    expect(chapter.content).toContain('<p>这是第二章内容</p>')
  })
})
