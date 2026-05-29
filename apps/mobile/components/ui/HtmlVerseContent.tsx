import React, { useMemo } from 'react'
import { useWindowDimensions, Linking } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { linkifyVersesInHtml } from '@bible-notes/shared'
import { colors, typography, spacing } from '../../theme'

const tagsStyles = {
  p: { marginBottom: spacing.sm, fontSize: typography.body.fontSize, lineHeight: 26, color: colors.text },
  strong: { fontWeight: '700' as const, color: colors.text },
  em: { fontStyle: 'italic' as const, color: colors.text },
  h1: { fontSize: typography.heading1.fontSize, fontWeight: '700' as const, color: colors.text, marginBottom: spacing.sm },
  h2: { fontSize: typography.heading2.fontSize, fontWeight: '700' as const, color: colors.text, marginBottom: spacing.sm },
  h3: { fontSize: typography.heading3.fontSize, fontWeight: '600' as const, color: colors.text, marginBottom: spacing.xs },
  ul: { marginLeft: spacing.md, marginBottom: spacing.sm },
  ol: { marginLeft: spacing.md, marginBottom: spacing.sm },
  li: { marginBottom: spacing.xs, lineHeight: 24 },
  blockquote: { backgroundColor: colors.surfaceHighlight, borderLeftColor: colors.primaryLight, borderLeftWidth: 4, paddingLeft: spacing.md, paddingVertical: spacing.sm, marginVertical: spacing.sm },
  a: { color: colors.primaryLight, textDecorationLine: 'underline' as const },
}

const renderersProps = {
  a: {
    onPress: (_event: unknown, href: string) => {
      Linking.openURL(href)
    },
  },
}

interface HtmlVerseContentProps {
  html: string
  version?: string
  contentWidth?: number
}

export function HtmlVerseContent({ html, version, contentWidth }: HtmlVerseContentProps) {
  const { width } = useWindowDimensions()
  const effectiveWidth = contentWidth ?? width - 32

  const processedHtml = useMemo(() => linkifyVersesInHtml(html, version), [html, version])
  const source = useMemo(() => ({ html: processedHtml }), [processedHtml])

  return (
    <RenderHtml
      contentWidth={effectiveWidth}
      source={source}
      tagsStyles={tagsStyles}
      renderersProps={renderersProps}
    />
  )
}
