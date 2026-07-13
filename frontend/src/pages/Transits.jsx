import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import ConstellationLoader from '../components/ConstellationLoader'

const HOUSE_DOMAINS = {
  1:  { name: 'Self & Identity',       icon: '♈︎' },
  2:  { name: 'Money & Values',         icon: '♉︎' },
  3:  { name: 'Mind & Communication',   icon: '♊︎' },
  4:  { name: 'Home & Roots',           icon: '♋︎' },
  5:  { name: 'Creativity & Romance',   icon: '♌︎' },
  6:  { name: 'Health & Service',       icon: '♍︎' },
  7:  { name: 'Partnerships',           icon: '♎︎' },
  8:  { name: 'Transformation',         icon: '♏︎' },
  9:  { name: 'Expansion & Belief',     icon: '♐︎' },
  10: { name: 'Career & Legacy',        icon: '♑︎' },
  11: { name: 'Community & Vision',     icon: '♒︎' },
  12: { name: 'Shadow & Spirit',        icon: '♓︎' },
}

const PLANET_GLYPHS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
}

// Local calendar date (YYYY-MM-DD) — toISOString() is UTC and rolls over hours early
function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function LockedTeaser({ onSignIn }) {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-purple-400 mb-3">Transit Houses</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            <span className="gold-text">Which chapters of your life</span>
            <br />
            <span className="text-purple-100">are the planets rewriting right now?</span>
          </h1>
          <p className="text-purple-300 text-lg leading-relaxed max-w-xl mx-auto">
            Jupiter could be blessing your 7th house, your relationships. Saturn might be
            pressing down on your 10th, your career. Mars may be igniting your 12th,
            your hidden self. Transit houses reveal which arenas of <em>your specific life</em> are
            under cosmic pressure today.
          </p>
        </div>

        {/* Blurred preview grid */}
        <div className="relative mb-10">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3" style={{ filter: 'blur(6px)', opacity: 0.35, pointerEvents: 'none' }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <div key={n} className="glass p-4 min-h-[90px]">
                <p className="text-xs text-purple-400 mb-1">H{n}</p>
                <p className="text-xs text-purple-300">{HOUSE_DOMAINS[n].name}</p>
                {n % 3 === 0 && (
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full border border-amber-500/50 text-amber-400">
                    ☉ {['Leo', 'Scorpio', 'Pisces', 'Aries'][Math.floor(n / 3) - 1]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="glass p-8 text-center max-w-sm mx-4">
              <p className="text-3xl mb-3">🔐</p>
              <h2 className="font-serif text-xl gold-text mb-2">Your Houses Await</h2>
              <p className="text-purple-300 text-sm mb-6 leading-relaxed">
                Sign in to see exactly which areas of your life today&apos;s planets are activating.
              </p>
              <button onClick={onSignIn} className="btn-cosmic w-full">
                Sign In to Unlock ✦
              </button>
            </div>
          </div>
        </div>

        <div className="divider" />
        <p className="text-center text-xs text-purple-500 mt-6" style={{ fontFamily: 'var(--font-label)', fontVariant: 'small-caps', letterSpacing: '0.1em' }}>
          Requires a saved natal chart · Login is free
        </p>
      </div>
    </div>
  )
}

function NoChartState() {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-6">🏛</p>
        <h2 className="font-serif text-2xl gold-text mb-3">Your Houses Need a Foundation</h2>
        <p className="text-purple-300 text-sm mb-8 leading-relaxed">
          Transit houses require your birth chart as their blueprint. Calculate and save
          your natal chart to unlock today&apos;s cosmic weather.
        </p>
        <a href="/chart" className="btn-celestial">
          Calculate My Chart ✦
        </a>
      </div>
    </div>
  )
}

export default function Transits() {
  const { user, loading: authLoading, openAuthModal } = useAuth()
  const [charts, setCharts] = useState(null)
  const [data, setData] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [reading, setReading] = useState('')
  const [readingLoading, setReadingLoading] = useState(false)
  const [readingError, setReadingError] = useState('')
  const pageRef = useRef(null)
  const readingRef = useRef(null)

  // Restore a reading generated for this exact chart + date
  const hydrateReading = useCallback((transitData) => {
    try {
      const cachedReading = JSON.parse(sessionStorage.getItem('khushtrology_transit_reading') || 'null')
      if (cachedReading?.date === transitData.date && cachedReading?.chart_id === transitData.chart_id) {
        setReading(cachedReading.reading)
      }
    } catch { /* corrupt cache — ignore */ }
  }, [])

  const loadTransits = useCallback((chartId) => {
    setReading('')
    setReadingError('')

    // Reuse today's cache when re-selecting the same chart
    try {
      const cached = JSON.parse(sessionStorage.getItem('khushtrology_transits') || 'null')
      if (cached?.date === localToday() && cached?.chart_id === chartId) {
        setData(cached)
        hydrateReading(cached)
        return
      }
    } catch { /* corrupt cache — ignore */ }

    setFetching(true)
    setFetchError('')
    api.get('/transits/houses', { params: { chart_id: chartId } })
      .then(res => {
        setData(res.data)
        sessionStorage.setItem('khushtrology_transits', JSON.stringify(res.data))
        hydrateReading(res.data)
        setTimeout(() => {
          gsap.fromTo(pageRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
          )
          gsap.fromTo('.house-card',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out', delay: 0.3 }
          )
        }, 50)
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setFetchError('That chart could not be found — it may have been deleted.')
        } else {
          setFetchError(err.response?.data?.detail || 'Failed to load transit data.')
        }
      })
      .finally(() => setFetching(false))
  }, [hydrateReading])

  useEffect(() => {
    if (authLoading || !user) return

    api.get('/charts/saved')
      .then(res => {
        const list = res.data
        setCharts(list)
        if (!list.length) {
          setFetchError('no-chart')
          return
        }

        // A valid cache for today means the user already picked — restore it
        try {
          const cached = JSON.parse(sessionStorage.getItem('khushtrology_transits') || 'null')
          if (cached?.date === localToday() && list.some(c => c.id === cached.chart_id)) {
            setData(cached)
            hydrateReading(cached)
            return
          }
        } catch { /* corrupt cache — ignore */ }

        // One chart — nothing to choose; several — show the picker
        if (list.length === 1) loadTransits(list[0].id)
      })
      .catch(err => {
        setFetchError(err.response?.data?.detail || 'Failed to load your saved charts.')
      })
  }, [user, authLoading, hydrateReading, loadTransits])

  const generateReading = async () => {
    setReadingError('')
    setReading('')
    setReadingLoading(true)
    try {
      const res = await api.post('/transits/reading', {
        natal_chart: data.natal_chart,
        name: data.name,
        transit_planets: data.transit_planets,
      })
      setReading(res.data.reading)
      sessionStorage.setItem('khushtrology_transit_reading', JSON.stringify({
        date: data.date,
        chart_id: data.chart_id,
        reading: res.data.reading,
      }))
      setTimeout(() => {
        readingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        gsap.fromTo(readingRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
            onComplete: () => gsap.fromTo('.transit-prose p',
              { y: 12, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
            ),
          }
        )
      }, 100)
    } catch (err) {
      setReadingError(err.response?.data?.detail || 'Failed to generate reading.')
    } finally {
      setReadingLoading(false)
    }
  }

  if (authLoading) return null

  if (!user) return <LockedTeaser onSignIn={openAuthModal} />

  if (fetchError === 'no-chart') return <NoChartState />

  if (fetchError) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-sm">{fetchError}</p>
      </div>
    )
  }

  if (fetching || charts === null) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
        <ConstellationLoader label="Reading today's sky…" />
      </div>
    )
  }

  // Multiple saved charts, none chosen yet — pick whose sky to read
  if (!data) {
    return (
      <div className="pt-28 pb-20 px-6 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-widest text-purple-400 mb-2">Cosmic Weather Report</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
              <span className="gold-text">Today&apos;s Sky</span>
            </h1>
            <p className="text-purple-300">Whose sky shall we read? Choose a saved chart.</p>
          </div>
          <div className="space-y-3">
            {charts.map(c => (
              <button
                key={c.id}
                onClick={() => loadTransits(c.id)}
                className="glass w-full p-5 text-left flex items-center justify-between gap-4 transition-colors hover:border-amber-500/50"
              >
                <div>
                  <p className="font-serif text-lg gold-text">{c.label || c.birth_name}</p>
                  <p className="text-purple-300 text-sm mt-1">
                    {c.birth_date} · {c.birth_time} · {c.city}, {c.country}
                  </p>
                </div>
                <span className="text-amber-400 text-xl">✦</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const planetsByHouse = {}
  for (const p of data.transit_planets) {
    if (p.transit_house) {
      if (!planetsByHouse[p.transit_house]) planetsByHouse[p.transit_house] = []
      planetsByHouse[p.transit_house].push(p)
    }
  }

  const mostHousePlanets = planetsByHouse[data.most_activated_house] || []

  return (
    <div className="pt-28 pb-20 px-6" ref={pageRef}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-purple-400 mb-2">Cosmic Weather Report</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            <span className="gold-text">Today&apos;s Sky</span>
          </h1>
          <p className="text-purple-300">{formatDate(data.date)} · {data.chart_label}</p>
          {charts.length > 1 && (
            <button
              onClick={() => { setData(null); setReading(''); setReadingError('') }}
              className="text-xs text-amber-400/80 hover:text-amber-300 mt-2 uppercase tracking-widest"
            >
              ↺ Read a different chart
            </button>
          )}
        </div>

        {/* Most-activated house callout */}
        {data.most_activated_house && (
          <div className="glass p-6 mb-8 border-amber-500/30" style={{ borderColor: 'rgba(212,168,67,0.3)' }}>
            <div className="flex items-start gap-4">
              <span className="text-3xl" style={{ fontVariantEmoji: 'text' }}>
                {HOUSE_DOMAINS[data.most_activated_house]?.icon}
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-400/80 mb-1">Most Activated</p>
                <h2 className="font-serif text-xl gold-text mb-1">
                  House {data.most_activated_house} — {HOUSE_DOMAINS[data.most_activated_house]?.name}
                </h2>
                <p className="text-purple-300 text-sm">
                  {mostHousePlanets.map(p => `${PLANET_GLYPHS[p.name] || ''} ${p.name}`).join(', ')} {mostHousePlanets.length === 1 ? 'is' : 'are'} moving through this chapter of your life right now.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* House grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-10">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => {
            const planets = planetsByHouse[n] || []
            const isActive = planets.length > 0
            const isMost = n === data.most_activated_house
            return (
              <div
                key={n}
                className={`house-card p-4 rounded transition-all ${
                  isMost
                    ? 'border border-amber-500/50 bg-amber-900/10'
                    : isActive
                    ? 'border border-purple-500/40 bg-purple-900/15'
                    : 'border border-purple-800/20 bg-purple-900/5'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs text-purple-500">H{n}</span>
                  {isMost && <span className="text-xs text-amber-400">✦</span>}
                </div>
                <p className="text-xs text-purple-400 leading-tight mb-2">{HOUSE_DOMAINS[n].name}</p>
                <div className="flex flex-wrap gap-1">
                  {planets.map(p => (
                    <span
                      key={p.name}
                      title={`${p.name} ${p.sign} ${p.degree}°${p.retrograde ? ' ℞' : ''}`}
                      className="text-xs px-1.5 py-0.5 rounded-full border text-amber-300"
                      style={{ borderColor: 'rgba(212,168,67,0.35)', background: 'rgba(212,168,67,0.08)', fontSize: '0.65rem' }}
                    >
                      {PLANET_GLYPHS[p.name] || p.name.slice(0, 3)}{p.retrograde ? ' ℞' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Transit planet list */}
        <div className="glass p-6 mb-8">
          <p className="text-xs uppercase tracking-widest text-purple-400 mb-4">Today&apos;s Planet Positions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.transit_planets.map(p => (
              <div key={p.name} className="flex items-center gap-3 py-2 border-b border-purple-800/20 last:border-0">
                <span className="text-lg w-6 text-center" style={{ color: '#d4a843' }}>
                  {PLANET_GLYPHS[p.name] || '·'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-purple-100">{p.name}</span>
                  {p.retrograde && <span className="text-xs text-purple-500 ml-1">℞</span>}
                </div>
                <span className="text-xs text-purple-300">{p.sign} {p.degree}°</span>
                <span className="text-xs text-purple-500">H{p.transit_house}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Reading */}
        <div className="divider mb-8" />

        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl gold-text mb-2">Your Transit Reading</h2>
          <p className="text-purple-300 text-sm">
            Let the AI interpret what these transits mean for you personally right now.
          </p>
        </div>

        {readingError && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
            ⚠ {readingError}
          </p>
        )}

        {!reading && (
          <button
            onClick={generateReading}
            disabled={readingLoading}
            className="btn-cosmic w-full text-base mb-4 disabled:opacity-50"
          >
            {readingLoading ? 'Reading the Houses…' : 'Generate Transit Reading ✦'}
          </button>
        )}

        {reading && !readingLoading && (
          <p className="text-center text-xs uppercase tracking-widest text-purple-400 mb-4">
            ✦ One reading per day — return tomorrow for a new sky ✦
          </p>
        )}

        {readingLoading && <ConstellationLoader label="Interpreting your houses…" />}

        {reading && (
          <div ref={readingRef} className="scroll-card mt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔮</span>
              <div>
                <p className="font-serif text-xl">{data.name}&rsquo;s Transit Reading</p>
                <p className="text-xs" style={{ color: '#6b4a16' }}>
                  {formatDate(data.date)} · Interpreted by Llama 3.3
                </p>
              </div>
            </div>
            <div
              className="transit-prose text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: reading.replace(/\n/g, '<br/>') }}
            />
            <div className="divider" style={{ '--divider-color': 'rgba(91, 62, 16, 0.35)' }} />
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: '#6b4a16' }}>
                Moved by your reading? Help keep Khushtrology written in the stars.
              </p>
              <a href="/donate" className="btn-cosmic btn-gold">
                Support Khushtrology ✦
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
