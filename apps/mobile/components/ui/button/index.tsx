import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native'
import { colors, radius, typography, shadows } from '../../../theme'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  style?: any
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16 },
    md: { paddingVertical: 16, paddingHorizontal: 24 },
    lg: { paddingVertical: 20, paddingHorizontal: 32 },
  }

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
  }

  const textColors = {
    primary: colors.textInverse,
    secondary: colors.textInverse,
    outline: colors.primary,
    ghost: colors.primary,
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        variant !== 'ghost' && variant !== 'outline' ? shadows.md : undefined,
        isDisabled ? styles.disabled : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { color: textColors[variant], fontSize: size === 'sm' ? 15 : 17 }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full, // Pill-shaped buttons for a more modern premium feel
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.6,
  },
})