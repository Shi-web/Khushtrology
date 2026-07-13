import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import StarLogo from './StarLogo'
import { useAuth } from '../contexts/AuthContext'

function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user.email?.[0]?.toUpperCase() ?? '✦'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
        style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.4)', color: '#d4a843' }}
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 py-1 z-50"
          style={{ background: 'rgba(26,15,60,0.97)', border: '1px solid rgba(212,168,67,0.2)' }}
        >
          <p className="px-4 py-2 text-xs text-purple-500 truncate">{user.email}</p>
          <div style={{ borderTop: '1px solid rgba(212,168,67,0.1)' }} />
          <Link
            to="/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-purple-200 hover:text-yellow-300 hover:bg-purple-900/30 transition-colors"
          >
            My Charts
          </Link>
          <button
            onClick={() => { setOpen(false); onSignOut() }}
            className="w-full text-left px-4 py-2 text-sm text-purple-200 hover:text-yellow-300 hover:bg-purple-900/30 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

const links = [
  { to: '/',          label: 'Home' },
  { to: '/chart',     label: 'Calculate Chart' },
  { to: '/reading',   label: 'AI Reading' },
  { to: '/transits',  label: "Today's Sky" },
  { to: '/donate',    label: 'Donate ✦' },
  { to: '/about',     label: 'About' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut, openAuthModal } = useAuth()
  const [open, setOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 20
      gsap.to(navRef.current, {
        backgroundColor: scrolled ? 'rgba(26,15,60,0.95)' : 'rgba(0,0,0,0)',
        backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
        borderBottomColor: scrolled ? 'rgba(212,168,67,0.15)' : 'rgba(0,0,0,0)',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ borderBottom: '1px solid rgba(0,0,0,0)' }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <StarLogo size={26} />
          <span className="font-serif text-xl font-semibold gold-text" style={{ letterSpacing: '0.05em' }}>
            Khushtrology
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === l.to
                  ? 'text-yellow-400'
                  : 'text-purple-200 hover:text-yellow-300'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <button
              onClick={openAuthModal}
              className="text-sm font-medium text-purple-200 hover:text-yellow-300 transition-colors duration-200"
            >
              Sign In
            </button>
          )}
        </div>

        <button
          className="md:hidden text-purple-200 p-2"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ background: 'rgba(26,15,60,0.97)', borderColor: 'rgba(212,168,67,0.15)' }}
        >
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium ${pathname === l.to ? 'text-yellow-400' : 'text-purple-200'}`}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className={`text-sm font-medium ${pathname === '/account' ? 'text-yellow-400' : 'text-purple-200'}`}
              >
                My Charts
              </Link>
              <button
                onClick={() => { setOpen(false); handleSignOut() }}
                className="text-sm font-medium text-purple-200 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { setOpen(false); openAuthModal() }}
              className="text-sm font-medium text-purple-200 text-left"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
