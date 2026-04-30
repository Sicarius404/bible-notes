import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: any
  variant?: 'default' | 'highlight' | 'subtle'
}

const bgColors = {
  default: '#ffffff',
  highlight: '#f0efe9',
  subtle: 'transparent',
}

export function Card({ children, onPress, style, variant = 'default' }: CardProps) {
  const shadowStyle = variant !== 'subtle' ? styles.shadow : null
  const content = (
    <View style={[styles.base, { backgroundColor: bgColors[variant] }, shadowStyle, style]}>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#5a5a5a',
    marginTop: 4,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8a8a8a',
    marginTop: 4,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#edece6',
  },
})