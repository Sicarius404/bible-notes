'use client'

import Script from 'next/script'
import { useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    BGLinks?: {
      version?: string
      clickTooltip?: boolean
      showTooltips?: boolean
      linkVerses: () => void
    }
  }
}

const SCRIPT_SRC = 'https://www.biblegateway.com/public/link-to-us/tooltips/bglinks.js'

function applyPopupTheme() {
  const isDark = document.documentElement.classList.contains('dark')
  const darkRules = [
    ['.bg_popup, .bg_popup-content, .bg_popup-content-bible', 'background-color', '#141414'],
    ['.bg_popup-header, .bg_popup-header_title', 'background-color', '#262626'],
    ['.bg_popup, .bg_popup-header, .bg_popup-content, .bg_popup-footer', 'background-image', 'none'],
    ['.bg_popup, .bg_popup-content-bible, .bg_popup-content-bible p, .bg_popup-content-bible p *', 'color', '#f5f5f4'],
    ['.bg_popup a, .bg_popup-content-bible a', 'color', '#e6b450'],
    ['.bg_popup-footer', 'background-color', '#211a0e'],
  ] as const

  for (const [selector, property, value] of darkRules) {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (isDark) element.style.setProperty(property, value, 'important')
      else element.style.removeProperty(property)
    })
  }
}

/** Load BibleGateway RefTagger and re-scan after Next navigations. */
export default function BibleGatewayRefTagger() {
  const pathname = usePathname()

  const tagVerses = useCallback(() => {
    const bgLinks = window.BGLinks
    if (!bgLinks) return

    bgLinks.version = 'NIV'
    bgLinks.clickTooltip = false
    bgLinks.showTooltips = true
    bgLinks.linkVerses()
    applyPopupTheme()
  }, [])

  useEffect(() => {
    // RefTagger is loaded once, but page content changes during client-side
    // navigation and after data fetches, so ask it to scan new content too.
    let timer = window.setTimeout(tagVerses, 0)
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        // Avoid observing the anchors RefTagger itself adds.
        observer.disconnect()
        tagVerses()
        observer.observe(document.body, { childList: true, subtree: true })
      }, 50)
    })

    observer.observe(document.body, { childList: true, subtree: true })
    const themeObserver = new MutationObserver(applyPopupTheme)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      themeObserver.disconnect()
    }
  }, [pathname, tagVerses])

  return <Script src={SCRIPT_SRC} strategy="afterInteractive" onLoad={tagVerses} />
}
