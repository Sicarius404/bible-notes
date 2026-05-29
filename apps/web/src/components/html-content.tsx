'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { linkifyVersesInHtml } from '@bible-notes/shared'
import {
  formatPlainTextAsHtml,
  removeEmptyParagraphsFromHtml,
} from './html-content-format'

const ALLOWED_TAGS = [
  'p', 'b', 'i', 'em', 'strong', 'u', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'blockquote', 'br', 'span', 'div',
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class']

interface HtmlContentProps {
  html: string
  className?: string
  linkifyVerses?: boolean
}

export default function HtmlContent({ html, className = '', linkifyVerses = false }: HtmlContentProps) {
  const sanitized = useMemo(() => {
    const htmlToProcess = linkifyVerses ? linkifyVersesInHtml(html) : html
    const hasHtmlTags = /<[^>]+>/.test(htmlToProcess)
    if (!hasHtmlTags) {
      return formatPlainTextAsHtml(htmlToProcess)
    }
    const sanitizedHtml = DOMPurify.sanitize(htmlToProcess, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    })

    return removeEmptyParagraphsFromHtml(sanitizedHtml)
  }, [html, linkifyVerses])

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
