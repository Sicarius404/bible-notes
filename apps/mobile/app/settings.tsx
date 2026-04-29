import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Modal, TextInput } from 'react-native'
import { router } from 'expo-router'
import { logIn } from '@bible-notes/pocketbase-client'
import { useAuth } from '../components/auth-provider'
import { Screen, Button, Input } from '../components/ui'
import { colors, spacing, typography, shadows, radius } from '../theme'
import {
  isBiometricAvailable,
  hasStoredCredentials,
  saveCredentials,
  clearCredentials,
  promptBiometricSetup,
  updateSessionTimestamp,
} from '../lib/biometric-auth'
import { Fingerprint, Shield, User, LogOut, Lock } from 'lucide-react-native'

export default function SettingsScreen() {
  const { user, logout, refreshUser, biometricAvailable, hasStoredCredentials: authHasCreds } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fingerprintSwitch, setFingerprintSwitch] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const check = async () => {
      if (biometricAvailable) {
        const creds = await hasStoredCredentials()
        setFingerprintSwitch(creds)
      } else {
        setFingerprintSwitch(false)
      }
    }
    check()
  }, [biometricAvailable, authHasCreds])

  const handleToggleFingerprint = async (value: boolean) => {
    if (value) {
      setPassword('')
      setPasswordError('')
      setShowPasswordModal(true)
    } else {
      setLoading(true)
      try {
        await clearCredentials()
        setFingerprintSwitch(false)
        await refreshUser()
        Alert.alert('Success', 'Fingerprint login has been disabled.')
      } catch (err: any) {
        console.error('Disable fingerprint error:', err)
        Alert.alert('Error', `Failed to disable fingerprint login: ${err?.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEnableFingerprint = async () => {
    if (!password.trim()) {
      setPasswordError('Password is required')
      return
    }

    setLoading(true)
    setPasswordError('')

    try {
      await logIn(user?.email || '', password)
      const result = await promptBiometricSetup()
      if (result.success) {
        await saveCredentials(user?.email || '', password)
        await updateSessionTimestamp()
        setFingerprintSwitch(true)
        await refreshUser()
        setShowPasswordModal(false)
        Alert.alert('Success', 'Fingerprint login has been enabled.')
      } else {
        console.log('[settings] Fingerprint setup cancelled:', result)
        if ('error' in result && result.error) {
          Alert.alert('Setup Failed', `Fingerprint error: ${result.error}`)
        } else {
          Alert.alert('Cancelled', 'Fingerprint setup was cancelled.')
        }
      }
    } catch (err: any) {
      console.error('Enable fingerprint error:', err)
      setPasswordError(`Invalid password. (${err?.message || 'Unknown error'})`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/login')
          },
        },
      ]
    )
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Profile Section */}
          <View style={styles.section}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <User size={32} color={colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <Text style={styles.email}>{user?.email || ''}</Text>
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Fingerprint size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Fingerprint Login</Text>
                  <Text style={styles.settingDescription}>
                    {fingerprintSwitch
                      ? 'Enabled — Use fingerprint to login quickly'
                      : 'Disabled — Login with email and password'}
                  </Text>
                </View>
              </View>
              <Switch
                value={fingerprintSwitch}
                onValueChange={handleToggleFingerprint}
                disabled={loading || !biometricAvailable}
                trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                thumbColor={colors.surface}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Session Duration</Text>
                  <Text style={styles.settingDescription}>
                    7 days - Fingerprint extends session
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="ghost"
              size="lg"
              style={styles.logoutButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* Password Modal for Enabling Biometric */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.card}>
            <View style={modalStyles.iconWrapper}>
              <Lock size={40} color={colors.primary} />
            </View>
            <Text style={modalStyles.title}>Enter Your Password</Text>
            <Text style={modalStyles.message}>
              To enable fingerprint login, please verify your password. This will be stored securely on your device.
            </Text>
            
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              icon={<Lock size={20} color={colors.textMuted} />}
            />
            
            {passwordError ? (
              <Text style={modalStyles.errorText}>{passwordError}</Text>
            ) : null}

            <Button
              title="Enable Fingerprint"
              onPress={handleEnableFingerprint}
              loading={loading}
              size="lg"
              style={{ width: '100%', marginBottom: spacing.md }}
            />
            <Button
              title="Cancel"
              onPress={() => {
                setShowPasswordModal(false)
                setFingerprintSwitch(false)
              }}
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
  container: {
    paddingTop: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logoutButton: {
    marginTop: spacing.md,
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
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
})
