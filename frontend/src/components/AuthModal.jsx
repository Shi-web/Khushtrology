import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp, resetPassword } = useAuth()
  const [tab, setTab]         = useState('signin')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [info, setInfo]       = useState('')
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef(null)
  const panelRef   = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    setError('')
    setInfo('')
    setEmail('')
    setPassword('')
    setTab('signin')
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(panelRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' })
  }, [isOpen])

  const handleOverlayClick = e => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      if (tab === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      } else if (tab === 'forgot') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setInfo('Check your email for a password reset link.')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setInfo('Check your email to confirm your account, then sign in.')
        setTab('signin')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(8,4,20,0.85)' }}
    >
      <div
        ref={panelRef}
        className="glass w-full max-w-sm p-8"
        style={{ borderRadius: '2px' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl gold-text">
            {tab === 'signin' ? 'Sign In' : tab === 'forgot' ? 'Reset Password' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-purple-200 transition-colors text-lg leading-none"
            aria-label="Close"
          >✕</button>
        </div>

        <div className="flex gap-0 mb-6 border border-purple-700/40 rounded-sm overflow-hidden">
          {['signin', 'signup'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setInfo('') }}
              className="flex-1 py-2 text-xs uppercase tracking-widest transition-colors duration-200"
              style={{
                background: tab === t ? 'rgba(212,168,67,0.12)' : 'transparent',
                color: tab === t ? '#d4a843' : '#a78bbc',
              }}
            >
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {info && (
          <p className="text-sm text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded-sm p-3 mb-4">
            ✦ {info}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-cosmic"
            />
          </div>

          {tab !== 'forgot' && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === 'signup' ? 'Min. 6 characters' : '••••••••'}
                required
                minLength={6}
                className="input-cosmic"
              />
              {tab === 'signin' && (
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); setError(''); setInfo('') }}
                  className="text-xs text-purple-400 hover:text-amber-400 transition-colors mt-2"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {tab === 'forgot' && (
            <p className="text-xs text-purple-400 leading-relaxed">
              Enter your account email and we&apos;ll send you a link to set a new password.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-sm p-3">
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-cosmic w-full mt-1 disabled:opacity-50"
          >
            {loading
              ? (tab === 'signin' ? 'Signing in…' : tab === 'forgot' ? 'Sending…' : 'Creating account…')
              : (tab === 'signin' ? 'Sign In ✦' : tab === 'forgot' ? 'Send Reset Link ✦' : 'Create Account ✦')}
          </button>

          {tab === 'forgot' && (
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(''); setInfo('') }}
              className="block mx-auto text-xs text-purple-400 hover:text-amber-400 transition-colors"
            >
              ← Back to sign in
            </button>
          )}
        </form>

        <p className="text-xs text-purple-500 text-center mt-5">
          Your chart data is stored securely and privately.
        </p>
      </div>
    </div>
  )
}
