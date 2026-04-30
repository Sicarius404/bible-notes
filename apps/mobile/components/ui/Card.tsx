import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, radius, spacing, shadows, typography } from '../../theme'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: any
  variant?: 'default' | 'highlight' | 'subtle'
}

export function Card({ children, onPress, style, variant = 'default' }: CardProps) {
  const bgColors = {
    default: colors.surface,
    highlight: colors.surfaceHighlight,
    subtle: 'transparent',
  }

  const content = (
    <View
      style={[
        styles.base,
        { backgroundColor: bgColors[variant] },
        variant !== 'subtle' && shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

export function CardTitle({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[styles.title, style]}>{children}</Text>
}

export function CardSubtitle({ children, style, numberOfLines }: { children: React.ReactNode; style?: any; numberOfLines?: number }) {
  return <Text style={[styles.subtitle, style]} numberOfLines={numberOfLines}>{children}</Text>
}

export function CardMeta({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[styles.meta, style]}>{children}</Text>
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.footer, style]}>{children}</View>
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading4,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
})
