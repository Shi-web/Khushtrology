import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Personal data cached for the session — must not survive a sign-out
const SESSION_KEYS = [
  'khushtrology_chart',
  'khushtrology_form',
  'khushtrology_chart_id',
  'khushtrology_readings',
  'khushtrology_transits',
  'khushtrology_transit_reading',
]

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [session, setSession]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        SESSION_KEYS.forEach(k => sessionStorage.removeItem(k))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase?.auth.signInWithPassword({ email, password })

  const signUp = (email, password) =>
    supabase?.auth.signUp({ email, password })

  const signOut = () => supabase?.auth.signOut()

  const resetPassword = (email) =>
    supabase?.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

  const updatePassword = (password) =>
    supabase?.auth.updateUser({ password })

  const openAuthModal  = () => setAuthModalOpen(true)
  const closeAuthModal = () => setAuthModalOpen(false)

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut, resetPassword, updatePassword, authModalOpen, openAuthModal, closeAuthModal }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
