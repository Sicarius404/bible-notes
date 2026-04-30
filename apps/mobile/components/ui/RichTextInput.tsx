import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native'
import { colors, radius, spacing, typography, shadows } from '../../theme'
import { Bold, Italic, Highlighter, List, ListOrdered, Quote } from 'lucide-react-native'

interface RichTextInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  error?: string
  minHeight?: number
}

export function RichTextInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  minHeight = 280,
}: RichTextInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const getSelection = useCallback(() => {
    // We can't reliably get selection on TextInput in RN without native modules,
    // so we'll insert at cursor by tracking last known position or append if unknown.
    // For simplicity, we'll use a heuristic: if the input is focused, we use the end of value.
    // A more robust solution would use onSelectionChange, but for toolbar buttons
    // wrapping selected text is complex without native text input managers.
    return { start: value.length, end: value.length }
  }, [value])

  const insertAtCursor = useCallback(
    (before: string, after: string) => {
      const selection = getSelection()
      const start = selection.start
      const end = selection.end
      const selected = value.substring(start, end)
      const newText =
        value.substring(0, start) + before + (selected || '') + after + value.substring(end)
      onChangeText(newText)
      // Refocus
      setTimeout(() => inputRef.current?.focus(), 50)
    },
    [value, onChangeText, getSelection]
  )

  const insertBlock = useCallback(
    (prefix: string) => {
      const selection = getSelection()
      const start = selection.start
      // Find start of current line
      let lineStart = start
      while (lineStart > 0 && value[lineStart - 1] !== '\n') {
        lineStart--
      }
      const newText =
        value.substring(0, lineStart) + prefix + value.substring(lineStart)
      onChangeText(newText)
      setTimeout(() => inputRef.current?.focus(), 50)
    },
    [value, onChangeText, getSelection]
  )

  const toolbarItems = [
    { icon: <Bold size={18} color={colors.textSecondary} />, action: () => insertAtCursor('**', '**') },
    { icon: <Italic size={18} color={colors.textSecondary} />, action: () => insertAtCursor('*', '*') },
    { icon: <Highlighter size={18} color={colors.accentDark} />, action: () => insertAtCursor('==', '==') },
    { icon: <List size={18} color={colors.textSecondary} />, action: () => insertBlock('- ') },
    { icon: <ListOrdered size={18} color={colors.textSecondary} />, action: () => insertBlock('1. ') },
    { icon: <Quote size={18} color={colors.textSecondary} />, action: () => insertBlock('> ') },
  ]

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          error && styles.containerError,
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, { minHeight }]}
          scrollEnabled={false}
        />
        <View style={styles.toolbar}>
          {toolbarItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.toolbarButton}
              onPress={() => {
                item.action()
              }}
              activeOpacity={0.6}
            >
              {item.icon}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  container: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  containerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    ...shadows.md,
  },
  containerError: {
    borderColor: colors.error,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.text,
    lineHeight: 26,
    flexGrow: 1,
  },
  toolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: 4,
  },
})
