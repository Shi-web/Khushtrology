import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import api from '../lib/api'
import ConstellationLoader from '../components/ConstellationLoader'

const READING_TYPES = [
  { value: 'natal',     label: '🌙 Natal Overview',     desc: 'Core personality, strengths, life themes' },
  { value: 'love',      label: '💕 Love & Relationships', desc: 'Venus, 5th/7th house, synastry patterns' },
  { value: 'career',    label: '⭐ Career & Purpose',    desc: 'Midheaven, Saturn, 10th house focus' },
  { value: 'spiritual', label: '🔮 Spiritual Path',      desc: 'North Node, 12th house, Neptune transits' },
]

export default function Reading() {
  const navigate = useNavigate()
  const [chart, setChart] = useState(null)
  const [form, setForm] = useState(null)
  const [readingType, setReadingType] = useState('natal')
  const [reading, setReading] = useState('')
  const [readings, setReadings] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef(null)
  const readingRef = useRef(null)

  useEffect(() => {
    const c = sessionStorage.getItem('khushtrology_chart')
    const f = sessionStorage.getItem('khushtrology_form')
    if (!c) return
    setChart(JSON.parse(c))
    setForm(JSON.parse(f))

    const cached = sessionStorage.getItem('khushtrology_readings')
    setReadings(cached ? JSON.parse(cached) : {})

    gsap.fromTo(
      containerRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
    )
  }, [navigate])

  // Show cached reading (or clear) when type changes
  useEffect(() => {
    setReading(readings[readingType] ?? '')
  }, [readingType, readings])

  const generateReading = async () => {
    setError('')
    setReading('')
    setLoading(true)
    try {
      const res = await api.post('/reading', {
        chart,
        name: form?.name,
        reading_type: readingType,
      })
      const text = res.data.reading
      setReading(text)
      const updated = { ...readings, [readingType]: text }
      setReadings(updated)
      sessionStorage.setItem('khushtrology_readings', JSON.stringify(updated))

      const chartId = sessionStorage.getItem('khushtrology_chart_id')
      if (chartId) {
        api.patch(`/charts/saved/${chartId}/readings`, {
          reading_type: readingType,
          reading_text: text,
        }).catch(() => {})
      }
      setTimeout(() => {
        readingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        gsap.fromTo(readingRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
            onComplete: () => {
              gsap.fromTo('.reading-prose p',
                { y: 12, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
              )
            }
          }
        )
      }, 100)
    } catch (err) {
      if (err.response?.status === 402) {
        navigate('/donate')
      } else {
        setError(err.response?.data?.detail || 'Failed to generate reading.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!chart) return (
    <div className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-6">🌙</p>
        <h2 className="font-serif text-2xl gold-text mb-3">No Chart Yet</h2>
        <p className="text-purple-300 text-sm mb-8">
          Calculate your birth chart first, then return here for your AI reading.
        </p>
        <a href="/chart" className="btn-celestial">
          Calculate Chart ✦
        </a>
      </div>
    </div>
  )

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto" ref={containerRef}>
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-purple-400 mb-2">Step 2</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            <span className="gold-text">Your Reading</span>
          </h1>
          <p className="text-purple-300 text-lg">
            Choose a focus area and let the stars speak.
          </p>
        </div>

        {/* Reading type selector */}
        <div className="glass p-6 mb-6">
          <p className="text-xs uppercase tracking-widest text-purple-400 mb-4">
            Select Reading Type
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {READING_TYPES.map(rt => (
              <button
                key={rt.value}
                onClick={() => setReadingType(rt.value)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  readingType === rt.value
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-purple-800/30 bg-purple-900/10 hover:border-purple-700/50'
                }`}
              >
                <p className="font-medium text-purple-100 mb-1">{rt.label}</p>
                <p className="text-xs text-purple-400">{rt.desc}</p>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs" style={{
            fontFamily: 'var(--font-label)',
            fontVariant: 'small-caps',
            letterSpacing: '0.1em',
            color: 'rgba(212, 168, 67, 0.7)',
          }}>
            {READING_TYPES.find(r => r.value === readingType)?.desc}
          </p>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
            ⚠ {error}
          </p>
        )}

        {!reading && (
          <button
            onClick={generateReading}
            disabled={loading}
            className="btn-cosmic w-full text-base mb-2 disabled:opacity-50"
          >
            {loading ? 'Reading the Stars…' : 'Generate AI Reading ✦'}
          </button>
        )}

        {reading && !loading && (
          <p className="text-center text-xs uppercase tracking-widest text-purple-400">
            ✦ One reading per chart, per type — the stars have spoken ✦
          </p>
        )}

        {loading && <ConstellationLoader label="Consulting your chart…" />}

        {/* Reading output — medieval scroll */}
        {reading && (
          <div ref={readingRef} className="scroll-card mt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔮</span>
              <div>
                <p className="font-serif text-xl">
                  {form?.name}&rsquo;s{' '}
                  {READING_TYPES.find(r => r.value === readingType)?.label} Reading
                </p>
                <p className="text-xs" style={{ color: '#6b4a16' }}>
                  Interpreted by Llama 3.3 · Powered by Swiss Ephemeris
                </p>
              </div>
            </div>

            <div
              className="reading-prose text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: reading.replace(/\n/g, '<br/>') }}
            />

            <div className="divider" style={{ '--divider-color': 'rgba(91, 62, 16, 0.35)' }} />
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: '#6b4a16' }}>
                Enjoyed your reading? Help keep Khushtrology written in the stars.
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
