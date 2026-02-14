import { useEffect } from 'react'
import { storageService } from '@/services/storageService'
import { useReaderStore } from '@/store/readerStore'

export function useReaderPreferences(): void {
  const fontSize = useReaderStore((state) => state.fontSize)
  const fontFamily = useReaderStore((state) => state.fontFamily)
  const lineHeight = useReaderStore((state) => state.lineHeight)
  const pageWidth = useReaderStore((state) => state.pageWidth)
  const theme = useReaderStore((state) => state.theme)
  const hydratePreferences = useReaderStore((state) => state.hydratePreferences)

  useEffect(() => {
    let active = true

    void storageService.loadReaderPreferences().then((prefs) => {
      if (!active || !prefs) {
        return
      }

      hydratePreferences(prefs)
    })

    return () => {
      active = false
    }
  }, [hydratePreferences])

  useEffect(() => {
    void storageService.saveReaderPreferences({
      fontSize,
      fontFamily,
      lineHeight,
      pageWidth,
      theme,
    })
  }, [fontFamily, fontSize, lineHeight, pageWidth, theme])
}
