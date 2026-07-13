import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import api from '../lib/api'
import ConstellationLoader from '../components/ConstellationLoader'
import { useAuth } from '../contexts/AuthContext'

const PLANET_SYMBOLS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
}

const HOUSE_SYSTEMS = [
  { value: 'P', label: 'Placidus' },
  { value: 'W', label: 'Whole Sign' },
  { value: 'K', label: 'Koch' },
  { value: 'E', label: 'Equal House' },
]

function locationLabel(place) {
  const a = place.address || {}
  const city = a.city || a.town || a.village || a.municipality || a.county || ''
  const state = a.state || ''
  const country = a.country || ''
  return [city, state, country].filter(Boolean).join(', ')
}

export default function BirthChart() {
  const navigate = useNavigate()
  const { user, openAuthModal } = useAuth()
  const formRef = useRef(null)
  const debounceRef = useRef(null)
  const dropdownRef = useRef(null)

  const [chartSaved, setChartSaved] = useState(false)
  const [savingChart, setSavingChart] = useState(false)

  const [form, setForm] = useState({
    name: '',
    date: '',
    time: '',
    city: '',
    country: '',
    lat: null,
    lon: null,
    house_system: 'P',
    timezone: 'UTC',
  })
  const [locationQuery, setLocationQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationSelected, setLocationSelected] = useState(false)
  const [timezoneLabel, setTimezoneLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [chart, setChart] = useState(null)

  useEffect(() => {
    gsap.fromTo(
      formRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )

    const savedForm = sessionStorage.getItem('khushtrology_form')
    const savedChart = sessionStorage.getItem('khushtrology_chart')
    if (savedForm && savedChart) {
      const f = JSON.parse(savedForm)
      setForm(f)
      setChart(JSON.parse(savedChart))
      if (f.city || f.country) {
        setLocationQuery([f.city, f.country].filter(Boolean).join(', '))
        setLocationSelected(true)
      }
      if (f.timezone && f.timezone !== 'UTC') {
        try {
          const utcOffset = new Intl.DateTimeFormat('en', {
            timeZone: f.timezone,
            timeZoneName: 'shortOffset',
          }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || ''
          setTimezoneLabel(`${f.timezone} · ${utcOffset}`)
        } catch {
          setTimezoneLabel(f.timezone)
        }
      }
    }
  }, [])

  useEffect(() => {
    const handleClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleLocationInput = e => {
    const query = e.target.value
    setLocationQuery(query)
    setLocationSelected(false)
    setTimezoneLabel('')
    setForm(f => ({ ...f, city: '', country: '', lat: null, lon: null, timezone: 'UTC' }))

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setSuggestions([]); return }

    debounceRef.current = setTimeout(async () => {
      setLocationLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        setSuggestions(await res.json())
      } catch {
        setSuggestions([])
      } finally {
        setLocationLoading(false)
      }
    }, 400)
  }

  const selectLocation = async place => {
    const a = place.address || {}
    const city = a.city || a.town || a.village || a.municipality || a.county || ''
    const country = a.country || ''
    const lat = parseFloat(place.lat)
    const lon = parseFloat(place.lon)
    setForm(f => ({ ...f, city, country, lat, lon }))
    setLocationQuery(locationLabel(place))
    setLocationSelected(true)
    setSuggestions([])

    try {
      const res = await fetch(`/api/chart/timezone?lat=${lat}&lon=${lon}`)
      const data = await res.json()
      const tz = data.timezone || 'UTC'
      const utcOffset = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
      }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || ''
      setTimezoneLabel(`${tz} · ${utcOffset}`)
      setForm(f => ({ ...f, timezone: tz }))
    } catch {
      setTimezoneLabel('UTC (timezone lookup failed)')
      setForm(f => ({ ...f, timezone: 'UTC' }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!locationSelected) {
      setError('Please select a location from the dropdown.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/chart', form)
      setChart(res.data)
      setChartSaved(false)
      sessionStorage.setItem('khushtrology_chart', JSON.stringify(res.data))
      sessionStorage.setItem('khushtrology_form', JSON.stringify(form))
      sessionStorage.removeItem('khushtrology_chart_id')
      sessionStorage.removeItem('khushtrology_readings')
      gsap.fromTo('.chart-result',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          onComplete: () => {
            gsap.fromTo('.planet-card',
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
            )
          }
        }
      )
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const goToReading = () => {
    sessionStorage.setItem('khushtrology_chart', JSON.stringify(chart))
    sessionStorage.setItem('khushtrology_form', JSON.stringify(form))
    navigate('/reading')
  }

  const handleSaveChart = async () => {
    if (!user) { openAuthModal(); return }
    setSavingChart(true)
    try {
      const res = await api.post('/charts/save', {
        birth_name: form.name,
        birth_date: form.date,
        birth_time: form.time,
        city: form.city,
        country: form.country,
        lat: form.lat,
        lon: form.lon,
        timezone: form.timezone,
        house_system: form.house_system,
        chart,
      })
      if (res.data?.id) {
        sessionStorage.setItem('khushtrology_chart_id', res.data.id)
      }
      setChartSaved(true)
    } catch {
      // silently fail — user can try again
    } finally {
      setSavingChart(false)
    }
  }

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div ref={formRef} className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-purple-400 mb-2">Step 1</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            <span className="gold-text">Birth Chart</span>
          </h1>
          <p className="text-purple-300 text-lg">
            Enter your birth details to calculate your natal chart.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="glass p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Your name"
                required
                className="input-cosmic"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={update}
                required
                className="input-cosmic"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
                Birth Time <span className="text-purple-500 normal-case">(local time)</span>
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={update}
                required
                className="input-cosmic"
              />
              {timezoneLabel && (
                <p className="text-xs text-purple-500 mt-1">✦ {timezoneLabel}</p>
              )}
            </div>

            <div className="sm:col-span-2 relative" ref={dropdownRef}>
              <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
                Birth Location
              </label>
              <input
                type="text"
                value={locationQuery}
                onChange={handleLocationInput}
                placeholder="Type a city, e.g. Mumbai, Tokyo, Paris…"
                autoComplete="off"
                required
                className="input-cosmic"
              />

              {locationLoading && (
                <p className="absolute right-3 top-9 text-xs text-purple-500">Searching…</p>
              )}

              {suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 rounded-lg border border-purple-700/40 bg-[#0d051f] shadow-xl overflow-hidden">
                  {suggestions.map((place, i) => {
                    const label = locationLabel(place)
                    const a = place.address || {}
                    const city = a.city || a.town || a.village || a.municipality || a.county || label
                    const sub = [a.state, a.country].filter(Boolean).join(', ')
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => selectLocation(place)}
                          className="w-full text-left px-4 py-3 hover:bg-purple-900/40 transition-colors border-b border-purple-800/20 last:border-0"
                        >
                          <p className="text-sm text-purple-100 font-medium">{city}</p>
                          {sub && <p className="text-xs text-purple-400 mt-0.5">{sub}</p>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              {locationSelected && (
                <p className="text-xs text-purple-500 mt-1">
                  ✦ {form.lat?.toFixed(4)}, {form.lon?.toFixed(4)}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
                House System
              </label>
              <select
                name="house_system"
                value={form.house_system}
                onChange={update}
                className="input-cosmic"
              >
                {HOUSE_SYSTEMS.map(h => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-cosmic w-full mt-2 disabled:opacity-50"
          >
            {loading ? 'Calculating…' : 'Calculate Chart ✦'}
          </button>
        </form>

        {loading && <ConstellationLoader label="Mapping the heavens…" />}

        {chart && (
          <div className="chart-result glass p-8 mt-8">
            <h2 className="font-serif text-2xl gold-text mb-6">
              {form.name}&rsquo;s Natal Chart
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-purple-400 mb-3">
                  Planetary Positions
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {chart.planets?.map(p => (
                    <div
                      key={p.name}
                      className="planet-card flex items-start gap-2 bg-purple-900/20 border border-purple-800/30 rounded-lg px-3 py-2"
                    >
                      <span className="text-xl text-yellow-400 leading-none mt-0.5">
                        {PLANET_SYMBOLS[p.name] || '✦'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-purple-100">
                          {p.name} in {p.sign}
                        </p>
                        <p className="text-xs text-purple-400">{p.degree}° · House {p.house}</p>
                        {p.retrograde && (
                          <p className="text-xs text-yellow-400">℞ Retrograde</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {chart.angles && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 mb-3">
                    Chart Angles
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(chart.angles).map(([k, v]) => (
                      <div
                        key={k}
                        className="bg-yellow-900/10 border border-yellow-700/20 rounded-lg px-3 py-2"
                      >
                        <p className="text-xs text-yellow-500">{k}</p>
                        <p className="text-sm font-medium text-yellow-200">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {chart.house_cusps?.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-400 mb-3">
                    House Cusps
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {chart.house_cusps.map((cusp, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-purple-900/10 border border-purple-800/20 rounded-lg px-3 py-2"
                      >
                        <span className="text-xs font-bold text-purple-500 w-6 shrink-0">
                          H{i + 1}
                        </span>
                        <span className="text-sm text-purple-200">{cusp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="divider" />
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={goToReading} className="btn-cosmic flex-1">
                Get AI Reading for This Chart ✦
              </button>
              <button
                onClick={handleSaveChart}
                disabled={savingChart || chartSaved}
                className="btn-cosmic flex-1 disabled:opacity-60"
              >
                {chartSaved
                  ? 'Chart Saved ✓'
                  : savingChart
                    ? 'Saving…'
                    : user ? 'Save to My Account ✦' : 'Sign In to Save ✦'}
              </button>
            </div>
            <div className="mt-3 text-center">
              <a href="/donate" className="btn-cosmic btn-gold w-full text-center block">
                Support Khushtrology ✦
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
