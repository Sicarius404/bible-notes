import React, { useState } from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'
import { colors, radius, spacing, typography, shadows } from '../../theme'

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  error?: string
  multiline?: boolean
  numberOfLines?: number
  keyboardType?: any
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  secureTextEntry?: boolean
  style?: any
  icon?: React.ReactNode
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  style,
  icon,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && styles.textArea,
            icon ? styles.inputWithIcon : undefined,
          ]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  iconContainer: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: 4,
  },
})
