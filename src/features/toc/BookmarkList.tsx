import type { Bookmark } from '@/types/book'

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onSelect: (bookmark: Bookmark) => void
  onRemove: (bookmarkId: string) => void
}

export function BookmarkList({
  bookmarks,
  onSelect,
  onRemove,
}: BookmarkListProps) {
  return (
    <section className="toc-panel">
      <h4>书签</h4>
      <div className="bookmark-list">
        {bookmarks.length === 0 && <p>还没有书签</p>}
        {bookmarks.map((bookmark) => (
          <article key={bookmark.id} className="bookmark-item">
            <button type="button" onClick={() => onSelect(bookmark)}>
              <strong>{bookmark.title}</strong>
              <p>{bookmark.excerpt}</p>
            </button>
            <button
              type="button"
              className="ui-button ui-button--ghost"
              onClick={() => onRemove(bookmark.id)}
            >
              删除
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
