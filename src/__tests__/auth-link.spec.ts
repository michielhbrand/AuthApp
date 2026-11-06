import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('auth link detection', () => {
  beforeEach(() => {
    vi.resetModules()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('reads an invite type from the URL hash', async () => {
    window.location.hash = '#access_token=token&type=invite'

    const link = await import('@/lib/auth-link')

    expect(link.initialAuthLinkType).toBe('invite')
  })

  it('reads a recovery type from the query string', async () => {
    window.history.replaceState({}, '', '/?type=recovery')

    const link = await import('@/lib/auth-link')

    expect(link.initialAuthLinkType).toBe('recovery')
  })

  it('reads a token hash from the query string', async () => {
    window.history.replaceState({}, '', '/?token_hash=abc123&type=invite')

    const link = await import('@/lib/auth-link')

    expect(link.initialAuthTokenHash).toBe('abc123')
  })

  it('captures an expired-link error from the URL', async () => {
    window.history.replaceState(
      {},
      '',
      '/#error=access_denied&error_description=Email%20link%20is%20invalid',
    )

    const link = await import('@/lib/auth-link')

    expect(link.initialAuthLinkError).toBe('Email link is invalid')
  })
})
