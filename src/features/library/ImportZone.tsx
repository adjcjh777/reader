import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ImportZoneProps {
  onSelect: (files: FileList | File[]) => Promise<void>
  disabled?: boolean
}

export function ImportZone({ onSelect, disabled }: ImportZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <section
      className={`import-zone${isDragging ? ' is-dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        void onSelect(event.dataTransfer.files)
      }}
    >
      <Upload size={20} />
      <div>
        <h3>导入你的电子书</h3>
        <p>支持 EPUB / MOBI / TXT，支持拖拽与批量选择</p>
      </div>
      <Button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        选择文件
      </Button>

      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept=".epub,.mobi,.txt"
        onChange={(event) => {
          if (event.target.files) {
            void onSelect(event.target.files)
            event.target.value = ''
          }
        }}
      />
    </section>
  )
}
