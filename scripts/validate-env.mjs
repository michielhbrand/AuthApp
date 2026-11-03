const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']
const missing = required.filter((name) => !process.env[name])

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

let url
try {
  url = new URL(process.env.VITE_SUPABASE_URL)
} catch {
  console.error('VITE_SUPABASE_URL must be a valid URL.')
  process.exit(1)
}

if (url.protocol !== 'https:' && url.protocol !== 'http:') {
  console.error('VITE_SUPABASE_URL must use http or https.')
  process.exit(1)
}

if (process.env.VITE_SUPABASE_PUBLISHABLE_KEY.startsWith('sb_secret_')) {
  console.error('VITE_SUPABASE_PUBLISHABLE_KEY contains a secret key. Use the publishable key.')
  process.exit(1)
}

console.log('Supabase environment variables are present.')
