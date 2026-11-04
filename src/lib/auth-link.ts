export type AuthLinkType = 'invite' | 'recovery' | null

function readParam(name: string): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const hashValue = hash.get(name)
  if (hashValue) {
    return hashValue
  }

  return new URLSearchParams(window.location.search).get(name)
}

const type = readParam('type')

export const initialAuthLinkType: AuthLinkType =
  type === 'invite' || type === 'recovery' ? type : null

export const initialAuthLinkError = readParam('error_description') ?? readParam('error')
