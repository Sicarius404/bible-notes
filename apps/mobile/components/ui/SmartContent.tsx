import React from 'react'
import { HtmlVerseContent } from './HtmlVerseContent'
import { MarkdownContent } from './MarkdownContent'

interface SmartContentProps {
  content: string
}

export function SmartContent({ content }: SmartContentProps) {
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content)

  if (hasHtmlTags) {
    return <HtmlVerseContent html={content} />
  }

  return <MarkdownContent content={content} />
}
