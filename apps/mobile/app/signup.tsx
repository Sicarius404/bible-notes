import { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native'
import { signUp } from '@bible-notes/pocketbase-client'
import { router } from 'expo-router'
import { Button, Input, Screen } from '../components/ui'
import { colors, spacing, typography, shadows } from '../theme'
import { User, Mail, Lock } from 'lucide-react-native'

const { width } = Dimensions.get('window')

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, name)
      router.replace('/')
    } catch (err) {
      console.error('Signup error:', err)
      setError('Failed to create account. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            {/* Geometric Overlay Patterns */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your spiritual journey today</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.form}>
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                icon={<User size={20} color={colors.textMuted} />}
              />

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                icon={<Mail size={20} color={colors.textMuted} />}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                icon={<Lock size={20} color={colors.textMuted} />}
              />

              <Button
                title="Create Account"
                onPress={handleSignup}
                loading={loading}
                size="lg"
                style={{ marginTop: spacing.md }}
              />

              <Button
                title="Already have an account? Sign In"
                onPress={() => router.push('/login')}
                variant="ghost"
                size="md"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.primary,
    paddingHorizontal: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl * 2,
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    backgroundColor: colors.primaryLight,
    opacity: 0.2,
    top: -width * 0.5,
    right: -width * 0.3,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    backgroundColor: colors.accent,
    opacity: 0.1,
    bottom: -width * 0.4,
    left: -width * 0.2,
  },
  title: {
    ...typography.heading1,
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  formContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 1.5,
    ...shadows.lg,
    flex: 1,
  },
  form: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(153,27,27,0.08)',
    padding: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
})
