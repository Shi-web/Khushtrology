import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ResetPassword() {
  const { user, loading: authLoading, updatePassword, openAuthModal } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const [saving, setSaving]     = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/'), 2500)
    } catch (err) {
      setError(err.message || 'Failed to update password.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return null

  // The recovery link signs the user in; no session means the link was bad or expired
  if (!user) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="glass max-w-sm w-full p-8 text-center">
          <p className="text-3xl mb-4">🕯</p>
          <h1 className="font-serif text-xl gold-text mb-3">Link Expired</h1>
          <p className="text-purple-300 text-sm mb-6 leading-relaxed">
            This password reset link is invalid or has expired. Request a new one
            from the sign-in window.
          </p>
          <button onClick={openAuthModal} className="btn-cosmic w-full">
            Open Sign In ✦
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="glass max-w-sm w-full p-8 text-center">
          <p className="text-3xl mb-4">✦</p>
          <h1 className="font-serif text-xl gold-text mb-3">Password Updated</h1>
          <p className="text-purple-300 text-sm leading-relaxed">
            You&apos;re signed in with your new password. Returning to the stars…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="glass max-w-sm w-full p-8">
        <h1 className="font-serif text-xl gold-text mb-2">Set a New Password</h1>
        <p className="text-purple-400 text-xs mb-6">for {user.email}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              className="input-cosmic"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="input-cosmic"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-sm p-3">
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-cosmic w-full mt-1 disabled:opacity-50"
          >
            {saving ? 'Updating…' : 'Update Password ✦'}
          </button>
        </form>
      </div>
    </div>
  )
}
