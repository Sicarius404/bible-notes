import React from 'react'
import { useWindowDimensions, Linking } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { linkifyVersesInHtml } from '@bible-notes/shared'
import { colors, typography, spacing } from '../../theme'

interface HtmlVerseContentProps {
  html: string
}

export function HtmlVerseContent({ html }: HtmlVerseContentProps) {
  const { width } = useWindowDimensions()
  const processedHtml = linkifyVersesInHtml(html)

  return (
    <RenderHtml
      contentWidth={width - 32}
      source={{ html: processedHtml }}
      tagsStyles={{
        p: { marginBottom: spacing.sm, fontSize: typography.body.fontSize, lineHeight: 26, color: colors.text },
        strong: { fontWeight: '700', color: colors.text },
        em: { fontStyle: 'italic', color: colors.text },
        h1: { fontSize: typography.heading1.fontSize, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
        h2: { fontSize: typography.heading2.fontSize, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
        h3: { fontSize: typography.heading3.fontSize, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
        ul: { marginLeft: spacing.md, marginBottom: spacing.sm },
        ol: { marginLeft: spacing.md, marginBottom: spacing.sm },
        li: { marginBottom: spacing.xs, lineHeight: 24 },
        blockquote: { backgroundColor: colors.surfaceHighlight, borderLeftColor: colors.primaryLight, borderLeftWidth: 4, paddingLeft: spacing.md, paddingVertical: spacing.sm, marginVertical: spacing.sm },
        a: { color: colors.primaryLight, textDecorationLine: 'underline' },
      }}
      renderersProps={{
        a: {
          onPress: (_event: any, href: string) => {
            Linking.openURL(href)
          },
        },
      }}
    />
  )
}
