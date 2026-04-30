import React from 'react'
import Markdown from 'react-native-markdown-display'
import { colors, typography, spacing, radius } from '../../theme'
import { Text, StyleSheet } from 'react-native'
import MarkdownIt from 'markdown-it'
import markdownItMark from 'markdown-it-mark'

const markdownItInstance = new MarkdownIt({ typographer: true }).use(markdownItMark)

interface MarkdownContentProps {
  content: string
}

const markStyle = {
  backgroundColor: '#FEF3C7',
  color: colors.text,
  paddingHorizontal: 2,
  borderRadius: 2,
}

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    lineHeight: 28,
  },
  heading1: {
    fontSize: typography.heading1.fontSize,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heading2: {
    fontSize: typography.heading2.fontSize,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heading3: {
    fontSize: typography.heading3.fontSize,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  paragraph: {
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  strong: {
    fontWeight: '700' as const,
    color: colors.text,
  },
  em: {
    fontStyle: 'italic' as const,
    color: colors.text,
  },
  bullet_list: {
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
  },
  ordered_list: {
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
  },
  list_item: {
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  blockquote: {
    backgroundColor: colors.surfaceHighlight,
    borderLeftColor: colors.primaryLight,
    borderLeftWidth: 4,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
    borderRadius: 4,
  },
  link: {
    color: colors.primaryLight,
    textDecorationLine: 'underline' as const,
  },
  code_inline: {
    backgroundColor: colors.surfaceHighlight,
    color: colors.primary,
    fontFamily: 'monospace',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  code_block: {
    backgroundColor: colors.surfaceHighlight,
    padding: spacing.md,
    borderRadius: radius.md,
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 22,
    marginVertical: spacing.sm,
  },
  hr: {
    backgroundColor: colors.borderLight,
    height: 1,
    marginVertical: spacing.md,
  },
})

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <Markdown
      markdownit={markdownItInstance}
      style={markdownStyles}
      rules={{
        mark: (node, children) => (
          <Text key={node.key} style={markStyle}>
            {children}
          </Text>
        ),
      }}
    >
      {content}
    </Markdown>
  )
}
