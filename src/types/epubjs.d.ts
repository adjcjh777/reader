declare module 'epubjs' {
  type NavigationItem = {
    id?: string
    href?: string
    label?: string
    subitems?: NavigationItem[]
  }

  type SpineSection = {
    idref?: string
    href?: string
    index?: number
    load: (request: (url: string) => Promise<unknown>) => Promise<unknown>
    render: (request: (url: string) => Promise<unknown>) => Promise<string>
    unload: () => void
  }

  type EpubBook = {
    ready: Promise<void>
    loaded: {
      navigation: Promise<{
        toc?: NavigationItem[]
      }>
      metadata: Promise<Record<string, string | undefined>>
    }
    spine: {
      spineItems?: SpineSection[]
      get: (target: number | string) => SpineSection
    }
    load: (url: string) => Promise<unknown>
    destroy: () => void
  }

  export default function ePub(source: string | ArrayBuffer): EpubBook
}
