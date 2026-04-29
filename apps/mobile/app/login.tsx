import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { logIn } from '@bible-notes/pocketbase-client'
import { router } from 'expo-router'
import { Button, Input, Screen } from '../components/ui'
import { useAuth } from '../components/auth-provider'
import { colors, spacing, typography, shadows, radius } from '../theme'
import { BookOpen, Mail, Lock, Fingerprint } from 'lucide-react-native'
import {
  isBiometricAvailable,
  hasStoredCredentials,
  getCredentials,
  promptBiometricLogin,
  promptBiometricSetup,
  saveCredentials,
  updateSessionTimestamp,
  clearCredentials,
} from '../lib/biometric-auth'

const { width } = Dimensions.get('window')

export default function LoginScreen() {
  const { refreshUser, biometricAvailable } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEnableModal, setShowEnableModal] = useState(false)
  const [hasCreds, setHasCreds] = useState(false)

  useEffect(() => {
    const check = async () => {
      const available = await isBiometricAvailable()
      if (available) {
        const creds = await hasStoredCredentials()
        setHasCreds(creds)
      }
    }
    check()
  }, [])

  const attemptFingerprintLogin = async () => {
    const creds = await getCredentials()
    if (!creds) {
      setError('No saved credentials. Please log in with your password first.')
      setHasCreds(false)
      return
    }

    try {
      const result = await promptBiometricLogin()
      if (!result.success) {
        console.log('[login] Fingerprint cancelled or failed:', result)
        if ('error' in result && result.error) {
          setError(`Fingerprint error: ${result.error}`)
        }
        return
      }

      setLoading(true)
      await logIn(creds.email, creds.password)
      await updateSessionTimestamp()
      await refreshUser()
      router.replace('/')
    } catch (err: any) {
      console.error('Fingerprint login error:', err)
      if (err?.message?.includes('Invalid') || err?.message?.includes('Failed')) {
        await clearCredentials()
        setHasCreds(false)
        setError('Password changed. Please log in with your password.')
      } else {
        setError(`Fingerprint login failed: ${err?.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }
    setError('')
    setLoading(true)
    try {
      await logIn(email, password)
      await updateSessionTimestamp()
      await refreshUser()

      const available = await isBiometricAvailable()
      const credsStored = await hasStoredCredentials()
      if (available && !credsStored) {
        setShowEnableModal(true)
      } else {
        router.replace('/')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleEnableFingerprint = async () => {
    setShowEnableModal(false)
    try {
      const result = await promptBiometricSetup()
      if (result.success) {
        await saveCredentials(email, password)
        setHasCreds(true)
        console.log('[login] Fingerprint enabled and credentials saved')
      } else {
        console.log('[login] Fingerprint setup cancelled:', result)
      }
      await refreshUser()
    } catch (err: any) {
      console.error('Enable fingerprint error:', err)
      Alert.alert('Setup Failed', `Could not enable fingerprint login: ${err?.message || 'Unknown error'}`)
    }
    router.replace('/')
  }

  const handleSkipFingerprint = () => {
    setShowEnableModal(false)
    router.replace('/')
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
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.iconContainer}>
              <BookOpen size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Bible Notes</Text>
            <Text style={styles.subtitle}>Your spiritual journal, always with you</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.form}>
              {error ? <Text style={styles.error}>{error}</Text> : null}

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
                placeholder="Enter your password"
                secureTextEntry
                icon={<Lock size={20} color={colors.textMuted} />}
              />

              <Button
                title="Sign In"
                onPress={handlePasswordLogin}
                loading={loading}
                size="lg"
                style={{ marginTop: spacing.md }}
              />

              {biometricAvailable && hasCreds && (
                <>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.fingerprintButton}
                    onPress={attemptFingerprintLogin}
                    activeOpacity={0.7}
                  >
                    <Fingerprint size={28} color={colors.primary} />
                    <Text style={styles.fingerprintText}>
                      Sign in with fingerprint
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <Button
                title="Don't have an account? Sign Up"
                onPress={() => router.push('/signup')}
                variant="ghost"
                size="md"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enable Fingerprint Modal */}
      <Modal
        visible={showEnableModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipFingerprint}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <View style={modalStyles.iconWrapper}>
              <Fingerprint size={40} color={colors.primary} />
            </View>
            <Text style={modalStyles.title}>Enable Fingerprint Login?</Text>
            <Text style={modalStyles.message}>
              Use your fingerprint for faster access next time. Your credentials are stored securely on this device.
            </Text>
            <Button
              title="Enable"
              onPress={handleEnableFingerprint}
              size="lg"
              style={{ width: '100%', marginBottom: spacing.md }}
            />
            <Button
              title="Not Now"
              onPress={handleSkipFingerprint}
              variant="ghost"
              size="md"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
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
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
  },
  fingerprintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  fingerprintText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
})

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
})
