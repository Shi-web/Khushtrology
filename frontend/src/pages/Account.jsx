import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

const SUN = '☉', MOON = '☽', ASC = '↑'

export default function Account() {
  const navigate = useNavigate()
  const { user, loading, openAuthModal, signOut } = useAuth()
  const [charts, setCharts]     = useState([])
  const [fetching, setFetching] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const pageRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(
      pageRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
    )
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) { setFetching(false); return }

    api.get('/charts/saved')
      .then(res => setCharts(res.data))
      .catch(() => setCharts([]))
      .finally(() => setFetching(false))
  }, [user, loading])

  const seedSessionStorage = (saved) => {
    const form = {
      name:         saved.birth_name,
      date:         saved.birth_date,
      time:         saved.birth_time,
      city:         saved.city,
      country:      saved.country,
      lat:          saved.lat,
      lon:          saved.lon,
      timezone:     saved.timezone,
      house_system: saved.house_system,
    }
    sessionStorage.setItem('khushtrology_chart', JSON.stringify(saved.chart_json))
    sessionStorage.setItem('khushtrology_form', JSON.stringify(form))
    sessionStorage.setItem('khushtrology_chart_id', saved.id)
    sessionStorage.setItem('khushtrology_readings', JSON.stringify(saved.readings_json || {}))
  }

  const loadChart = (saved) => {
    seedSessionStorage(saved)
    navigate('/chart')
  }

  const getReading = (saved) => {
    seedSessionStorage(saved)
    navigate('/reading')
  }

  const deleteChart = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/charts/saved/${id}`)
      setCharts(prev => prev.filter(c => c.id !== id))
      if (sessionStorage.getItem('khushtrology_chart_id') === id) {
        sessionStorage.removeItem('khushtrology_chart_id')
        sessionStorage.removeItem('khushtrology_readings')
      }
    } catch {
      // noop
    } finally {
      setDeletingId(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) return null

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto" ref={pageRef}>

        {!user ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">✦</p>
            <h1 className="font-serif text-3xl gold-text mb-3">My Charts</h1>
            <p className="text-purple-300 mb-8">Sign in to save and revisit your natal charts.</p>
            <button onClick={openAuthModal} className="btn-cosmic px-8">
              Sign In ✦
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-purple-400 mb-1">Account</p>
                <h1 className="font-serif text-3xl md:text-4xl font-bold">
                  <span className="gold-text">My Charts</span>
                </h1>
                <p className="text-purple-400 text-sm mt-1">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-purple-400 hover:text-purple-200 transition-colors self-start mt-1"
              >
                Sign Out
              </button>
            </div>

            {fetching ? (
              <div className="text-center py-16 text-purple-400">Loading charts…</div>
            ) : charts.length === 0 ? (
              <div className="glass p-10 text-center">
                <p className="text-purple-300 mb-6">No saved charts yet.</p>
                <button onClick={() => navigate('/chart')} className="btn-cosmic px-8">
                  Calculate Your First Chart ✦
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {charts.map(saved => {
                  const c = saved.chart_json
                  return (
                    <div key={saved.id} className="glass p-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h2 className="font-serif text-xl gold-text mb-1">
                            {saved.label || saved.birth_name}
                          </h2>
                          <p className="text-sm text-purple-300">
                            {saved.birth_date} · {saved.birth_time} · {[saved.city, saved.country].filter(Boolean).join(', ')}
                          </p>
                          {c && (
                            <p className="text-xs text-purple-400 mt-2">
                              {SUN} {c.sun_sign} &nbsp;·&nbsp;
                              {MOON} {c.moon_sign} &nbsp;·&nbsp;
                              {ASC} {c.rising_sign}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => deleteChart(saved.id)}
                          disabled={deletingId === saved.id}
                          className="text-xs text-purple-500 hover:text-red-400 transition-colors disabled:opacity-40 shrink-0 mt-1"
                          aria-label="Delete chart"
                        >
                          {deletingId === saved.id ? 'Deleting…' : '✕ Delete'}
                        </button>
                      </div>

                      <div className="divider" />

                      <div className="flex gap-3 flex-col sm:flex-row">
                        <button onClick={() => loadChart(saved)} className="btn-cosmic flex-1 text-sm py-2">
                          View Chart ✦
                        </button>
                        <button onClick={() => getReading(saved)} className="btn-cosmic flex-1 text-sm py-2">
                          AI Reading ✦
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="text-center mt-10">
              <button onClick={() => navigate('/chart')} className="btn-cosmic px-8">
                Calculate New Chart ✦
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
