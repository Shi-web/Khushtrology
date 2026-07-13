import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ZodiacWheel from '../components/ZodiacWheel'

gsap.registerPlugin(ScrollTrigger)

const SIGNS = [
  { symbol: '♈\uFE0E', name: 'Aries' },
  { symbol: '♉\uFE0E', name: 'Taurus' },
  { symbol: '♊\uFE0E', name: 'Gemini' },
  { symbol: '♋\uFE0E', name: 'Cancer' },
  { symbol: '♌\uFE0E', name: 'Leo' },
  { symbol: '♍\uFE0E', name: 'Virgo' },
  { symbol: '♎\uFE0E', name: 'Libra' },
  { symbol: '♏\uFE0E', name: 'Scorpio' },
  { symbol: '♐\uFE0E', name: 'Sagittarius' },
  { symbol: '♑\uFE0E', name: 'Capricorn' },
  { symbol: '♒\uFE0E', name: 'Aquarius' },
  { symbol: '♓\uFE0E', name: 'Pisces' },
]

const STEPS = [
  {
    numeral: 'I',
    title: 'Calculate Your Chart',
    desc: 'Enter your birth date, time, and place — the sky is mapped in seconds.',
    href: '/chart',
  },
  {
    numeral: 'II',
    title: 'Receive Your Reading',
    desc: 'AI interprets your exact placements into a reading written only for you.',
    href: '/reading',
  },
  {
    numeral: 'III',
    title: "Follow Today's Sky",
    desc: 'Save your chart to see how each day’s planets move through your houses.',
    href: '/transits',
  },
]

const FEATURES = [
  {
    icon: '🌙',
    title: 'Natal Birth Chart',
    desc: 'Precise planetary positions at your moment of birth, calculated with Swiss Ephemeris.',
    href: '/chart',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Interpretation',
    desc: 'AI reads the full complexity of your chart and delivers nuanced, personal insights.',
    href: '/reading',
  },
  {
    icon: '✨',
    title: "Today's Sky",
    desc: 'See which chapters of your life the planets are rewriting right now. Requires a saved chart.',
    href: '/transits',
  },
  {
    icon: '💫',
    title: 'Relationship Synastry',
    desc: 'Coming Soon',
    href: null,
  },
]

export default function Home() {
  const heroRef = useRef(null)
  const wheelRef = useRef(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.hero-title',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      )
      gsap.fromTo('.hero-sub',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.6 }
      )
      gsap.fromTo('.hero-cta',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.9 }
      )

      // Feature cards stagger on scroll
      gsap.fromTo('.feature-card',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
        }
      )

      // How-it-works steps stagger on scroll
      gsap.fromTo('.step-item',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.18, ease: 'power2.out',
          scrollTrigger: { trigger: '.steps-row', start: 'top 85%' },
        }
      )

      // Signs strip scroll
      gsap.fromTo('.sign-item',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '.signs-strip', start: 'top 85%' },
        }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={heroRef}>
      {/* ── Hero ──────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        {/* Glowing orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Zodiac wheel */}
          <div className="flex justify-center mb-8">
            <ZodiacWheel ref={wheelRef} />
          </div>

          <h1 className="hero-title font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="gold-text">Your stars,</span>
            <br />
            <span className="text-purple-100">decoded.</span>
          </h1>

          <p className="hero-sub text-lg md:text-xl text-purple-300 mb-10 leading-relaxed max-w-xl mx-auto">
            Khushtrology combines ancient astrological wisdom with the power of
            AI to deliver deeply personal cosmic readings.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/chart" className="btn-cosmic text-base">
              Read My Chart
            </Link>
            <Link to="/donate" className="btn-cosmic text-base">
              Support Khushtrology ✦
            </Link>
          </div>
        </div>
      </section>

      {/* ── Zodiac signs strip ───────────────────── */}
      <section className="relative z-10 py-16 overflow-hidden">
        <div className="divider mb-0" />
        <div className="signs-strip flex flex-wrap justify-center gap-4 py-10 px-6 max-w-4xl mx-auto">
          {SIGNS.map(s => (
            <div
              key={s.name}
              className="sign-item flex flex-col items-center gap-1 w-16 cursor-default"
            >
              <span
                className="text-3xl"
                style={{
                  color: '#d4a843',
                  fontFamily: 'var(--font-display, "Playfair Display SC", serif)',
                  fontVariantEmoji: 'text',
                }}
              >
                {s.symbol}
              </span>
              <span className="text-xs text-purple-400">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="divider mt-0" />
      </section>

      {/* ── How it works ─────────────────────────── */}
      <section className="relative z-10 py-16 px-6">
        <h2 className="font-serif text-4xl text-center mb-14">
          How It <span className="gold-text">Works</span>
        </h2>
        <div className="steps-row max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {STEPS.map(s => (
            <Link
              key={s.numeral}
              to={s.href}
              className="step-item glass p-6 text-center block hover:border-purple-500/40 transition-colors group"
            >
              <p
                className="font-serif text-3xl mb-3"
                style={{ color: 'var(--color-gold)' }}
              >
                {s.numeral}
              </p>
              <h3 className="font-serif text-lg font-semibold text-purple-100 mb-2 group-hover:text-yellow-300 transition-colors">
                {s.title}
              </h3>
              <p className="text-sm text-purple-300 leading-relaxed">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section ref={featuresRef} className="section">
        <h2 className="font-serif text-4xl text-center mb-4">
          What <span className="gold-text">Khushtrology</span> Offers
        </h2>
        <p className="text-center text-purple-300 mb-14 max-w-xl mx-auto">
          Precision astrology powered by Swiss Ephemeris, interpreted by AI.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(f => {
            const inner = (
              <>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-lg font-semibold text-purple-100 mb-2">{f.title}</h3>
                <p className="text-sm text-purple-300 leading-relaxed">{f.desc}</p>
              </>
            )
            return f.href ? (
              <Link
                key={f.title}
                to={f.href}
                className="feature-card glass p-6 hover:border-purple-500/40 transition-colors block"
              >
                {inner}
              </Link>
            ) : (
              <div key={f.title} className="feature-card glass p-6">
                {inner}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────── */}
      <section className="relative z-10 py-20 px-6">
        <div
          className="max-w-3xl mx-auto glass p-12 text-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(13,5,31,0.8) 100%)',
          }}
        >
          <p className="text-sm uppercase tracking-widest text-purple-400 mb-3">
            ✦ Limited Readings Available ✦
          </p>
          <h2 className="font-serif text-4xl font-bold mb-4 text-purple-100">
            Ready to meet your cosmic self?
          </h2>
          <p className="text-purple-300 mb-8 leading-relaxed">
            Your natal chart is a snapshot of the sky at the moment you were born.
            Let AI decode every placement, aspect, and transit.
          </p>
          <Link to="/chart" className="btn-cosmic btn-gold text-base">
            Read My Chart
          </Link>
        </div>
      </section>
    </div>
  )
}