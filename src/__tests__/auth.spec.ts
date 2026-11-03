import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Session } from '@supabase/supabase-js'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  onAuthStateChange: vi.fn<(...args: unknown[]) => unknown>(),
  signInWithPassword: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  signOut: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: mocks,
  },
}))

import { useAuthStore } from '@/stores/auth'

const session = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-1',
    email: 'demo@example.com',
    app_metadata: { provider: 'email' },
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
  },
} as unknown as Session

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn<() => void>() } },
    })
  })

  it('initializes from the existing Supabase session', async () => {
    mocks.getSession.mockResolvedValue({ data: { session }, error: null })
    const auth = useAuthStore()

    await auth.initialize()

    expect(auth.initialized).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.email).toBe('demo@example.com')
    expect(mocks.onAuthStateChange).toHaveBeenCalledOnce()
  })

  it('signs in with email and password', async () => {
    mocks.signInWithPassword.mockResolvedValue({ data: { session }, error: null })
    const auth = useAuthStore()

    const signedIn = await auth.signIn('demo@example.com', 'password')

    expect(signedIn).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'demo@example.com',
      password: 'password',
    })
  })

  it('exposes a friendly message for invalid credentials', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    })
    const auth = useAuthStore()

    const signedIn = await auth.signIn('demo@example.com', 'wrong-password')

    expect(signedIn).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toBe('Invalid email or password.')
  })

  it('clears the session on sign out', async () => {
    mocks.getSession.mockResolvedValue({ data: { session }, error: null })
    mocks.signOut.mockResolvedValue({ error: null })
    const auth = useAuthStore()
    await auth.initialize()

    await auth.signOut()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(mocks.signOut).toHaveBeenCalledOnce()
  })
})
