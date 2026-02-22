'use client'
// app/login/page.tsx
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [passphrase, setPassphrase] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/'

  const handlePassphrase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      passphrase,
      callbackUrl,
      redirect: false,
    })
    if (res?.error) {
      setError('Incorrect passphrase.')
      setLoading(false)
    } else if (res?.url) {
      window.location.href = res.url
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-night-950 bg-grid px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-palantir-400 text-4xl font-mono mb-3">◎</div>
          <h1 className="text-2xl font-bold text-white">PalantirLearning</h1>
          <p className="text-night-400 text-sm mt-1">Owner-only access</p>
        </div>

        <div className="bg-night-900 border border-night-700 rounded-xl p-6 space-y-4">
          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-night-800" />
            <span className="text-night-600 text-xs">or</span>
            <div className="flex-1 h-px bg-night-800" />
          </div>

          {/* Passphrase */}
          <form onSubmit={handlePassphrase} className="space-y-3">
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter passphrase…"
              className="w-full px-4 py-3 bg-night-800 border border-night-700 rounded-lg text-white placeholder-night-500 text-sm focus:outline-none focus:border-palantir-500 transition-colors"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || !passphrase}
              className="w-full py-3 bg-palantir-700 hover:bg-palantir-600 disabled:bg-night-800 disabled:text-night-500 text-white rounded-lg text-sm font-medium transition-all"
            >
              {loading ? 'Signing in…' : 'Sign in with Passphrase'}
            </button>
          </form>
        </div>

        <p className="text-center text-night-600 text-xs mt-4">
          Not affiliated with Palantir Technologies Inc.
        </p>
      </div>
    </div>
  )
}
