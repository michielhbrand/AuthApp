import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Something went wrong. Please try again.'
}

function friendlyErrorMessage(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'This account has not been confirmed yet. Confirm it in Supabase first.'
  }

  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'Could not reach Supabase. Check your connection and environment values.'
  }

  return message
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const user = computed<User | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => session.value !== null)
  let unsubscribe: (() => void) | undefined

  async function initialize(): Promise<void> {
    if (initialized.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        throw sessionError
      }

      session.value = data.session

      if (!unsubscribe) {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          session.value = nextSession
        })
        unsubscribe = () => listener.subscription.unsubscribe()
      }
    } catch (caught) {
      error.value = friendlyErrorMessage(errorMessage(caught))
    } finally {
      initialized.value = true
      loading.value = false
    }
  }

  async function signIn(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      session.value = data.session
      return true
    } catch (caught) {
      error.value = friendlyErrorMessage(errorMessage(caught))
      return false
    } finally {
      loading.value = false
    }
  }

  async function signOut(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        throw signOutError
      }

      session.value = null
    } catch (caught) {
      error.value = friendlyErrorMessage(errorMessage(caught))
    } finally {
      loading.value = false
    }
  }

  return {
    session,
    initialized,
    loading,
    error,
    user,
    isAuthenticated,
    initialize,
    signIn,
    signOut,
  }
})
