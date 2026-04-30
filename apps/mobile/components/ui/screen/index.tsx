import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '../../../theme'

interface ScreenProps {
  children: React.ReactNode
  style?: any
  scroll?: boolean
}

export function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.container, style]} edges={['top']}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  )
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={sectionStyles.header}>
      <Text style={sectionStyles.title}>{title}</Text>
      {action}
    </View>
  )
}

export function EmptyState({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
}) {
  return (
    <View style={emptyStyles.container}>
      {icon && <View style={emptyStyles.iconContainer}>{icon}</View>}
      <Text style={emptyStyles.title}>{title}</Text>
      {subtitle && <Text style={emptyStyles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

export function LoadingScreen() {
  return (
    <Screen style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const sectionStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
  },
})

const emptyStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 16,
    marginVertical: spacing.md,
  },
  iconContainer: {
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
})