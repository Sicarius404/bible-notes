'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'
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
}

export default function HtmlContent({ html, className = '' }: HtmlContentProps) {
  const sanitized = useMemo(() => {
    const hasHtmlTags = /<[^>]+>/.test(html)
    if (!hasHtmlTags) {
      return formatPlainTextAsHtml(html)
    }
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    })

    return removeEmptyParagraphsFromHtml(sanitizedHtml)
  }, [html])

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
