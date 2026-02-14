import type { TableOfContentsItem } from '@/types/book'

interface TableOfContentsProps {
  items: TableOfContentsItem[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function TableOfContents({
  items,
  activeIndex,
  onSelect,
}: TableOfContentsProps) {
  return (
    <section className="toc-panel">
      <h4>目录</h4>
      <div className="toc-list">
        {items.length === 0 && <p>暂无目录数据</p>}
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`toc-item${item.index === activeIndex ? ' is-active' : ''}`}
            onClick={() => onSelect(item.index)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  )
}
