import { getPocketBase, resetPocketBase } from './client'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  created: string
  updated: string
}

/**
 * Sign up a new user with email and password.
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthUser> {
  const pb = getPocketBase()
  const record = await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name: name || email.split('@')[0],
  })

  // Auto-login after signup
  await pb.collection('users').authWithPassword(email, password)

  return mapUser(pb.authStore.record)
}

/**
 * Log in with email and password.
 */
export async function logIn(email: string, password: string): Promise<AuthUser> {
  const pb = getPocketBase()
  await pb.collection('users').authWithPassword(email, password)
  return mapUser(pb.authStore.record)
}

/**
 * Log out the current user.
 */
export async function logOut(): Promise<void> {
  const pb = getPocketBase()
  pb.authStore.clear()
  resetPocketBase()
}

/**
 * Get the currently authenticated user, or null if not logged in.
 */
export function getCurrentUser(): AuthUser | null {
  const pb = getPocketBase()
  if (!pb.authStore.isValid || !pb.authStore.record) return null
  return mapUser(pb.authStore.record)
}

/**
 * Check if the user is currently authenticated.
 */
export function isAuthenticated(): boolean {
  const pb = getPocketBase()
  return pb.authStore.isValid
}

/**
 * Request a password reset email.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const pb = getPocketBase()
  await pb.collection('users').requestPasswordReset(email)
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(data: { name?: string; avatar?: File }): Promise<AuthUser> {
  const pb = getPocketBase()
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('Not authenticated')

  const record = await pb.collection('users').update(userId, data)
  return mapUser(record)
}

function mapUser(record: Record<string, unknown> | null): AuthUser {
  if (!record) throw new Error('No user record')
  return {
    id: record.id as string,
    email: record.email as string,
    name: record.name as string,
    avatar: record.avatar as string | undefined,
    created: record.created as string,
    updated: record.updated as string,
  }
}