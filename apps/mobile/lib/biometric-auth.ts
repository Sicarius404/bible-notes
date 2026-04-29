import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

const CREDENTIALS_KEY = 'biometric_credentials'
const LAST_AUTH_KEY = 'last_auth_timestamp'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface StoredCredentials {
  email: string
  password: string
}

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    if (!compatible) {
      console.log('[biometric] Hardware not compatible')
      return false
    }
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    console.log('[biometric] Enrolled:', enrolled)
    return enrolled
  } catch (err) {
    console.error('[biometric] isBiometricAvailable error:', err)
    return false
  }
}

export async function hasStoredCredentials(): Promise<boolean> {
  const creds = await getCredentials()
  return creds !== null
}

export async function saveCredentials(email: string, password: string): Promise<void> {
  const data: StoredCredentials = { email, password }
  await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(data))
}

export async function getCredentials(): Promise<StoredCredentials | null> {
  const value = await SecureStore.getItemAsync(CREDENTIALS_KEY)
  if (!value) return null
  try {
    return JSON.parse(value) as StoredCredentials
  } catch {
    return null
  }
}

export async function clearCredentials(): Promise<void> {
  await SecureStore.deleteItemAsync(CREDENTIALS_KEY)
  await SecureStore.deleteItemAsync(LAST_AUTH_KEY)
}

export async function updateSessionTimestamp(): Promise<void> {
  await SecureStore.setItemAsync(LAST_AUTH_KEY, Date.now().toString())
}

export async function isSessionValid(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(LAST_AUTH_KEY)
  if (!value) return false
  const lastAuth = parseInt(value, 10)
  if (isNaN(lastAuth)) return false
  return Date.now() - lastAuth < SESSION_DURATION_MS
}

export async function promptBiometricLogin(): Promise<LocalAuthentication.LocalAuthenticationResult> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in with your fingerprint',
      cancelLabel: 'Use password',
      fallbackLabel: 'Use password',
      disableDeviceFallback: false,
    })
    console.log('[biometric] promptBiometricLogin result:', result)
    return result
  } catch (err) {
    console.error('[biometric] promptBiometricLogin error:', err)
    throw err
  }
}

export async function promptBiometricSetup(): Promise<LocalAuthentication.LocalAuthenticationResult> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm with your fingerprint to enable faster login',
      cancelLabel: 'Not now',
      fallbackLabel: 'Use password',
      disableDeviceFallback: false,
    })
    console.log('[biometric] promptBiometricSetup result:', result)
    return result
  } catch (err) {
    console.error('[biometric] promptBiometricSetup error:', err)
    throw err
  }
}
