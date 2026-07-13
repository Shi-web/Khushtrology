import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

const BLESSINGS = [
  '♈ May Aries fire your courage for what comes next.',
  '♉ May Taurus root you in steady, lasting abundance.',
  '♊ May Gemini keep your mind quick and your conversations rich.',
  '♋ May Cancer wrap you in the comfort of home, wherever you are.',
  '♌ May Leo light your path with warmth and confidence.',
  '♍ May Virgo sharpen your eye for the details that matter.',
  '♎ May Libra bring balance to all you carry.',
  '♏ May Scorpio deepen your courage to transform.',
  '♐ May Sagittarius widen your horizons beyond the map.',
  '♑ May Capricorn steady your climb toward what you’re building.',
  '♒ May Aquarius spark the idea that changes everything.',
  '♓ May Pisces deepen your intuition and your dreams.',
]

export default function Success() {
  const containerRef = useRef(null)
  const [blessing] = useState(() => BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.success-icon',
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)', delay: 0.2 }
      )
      gsap.fromTo(
        '.success-text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.6, stagger: 0.15 }
      )
      gsap.fromTo(
        '.success-stars',
        { opacity: 0 },
        { opacity: 1, duration: 1.5, delay: 1, repeat: -1, yoyo: true }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20" ref={containerRef}>
      <div className="max-w-lg mx-auto text-center glass p-12">
        <div className="success-icon text-7xl mb-6">🌟</div>

        <div className="success-stars text-2xl mb-2 tracking-widest text-yellow-400">
          ✦ ✦ ✦
        </div>

        <h1 className="success-text font-serif text-4xl font-bold mb-3">
          <span className="gold-text">Thank You!</span>
        </h1>

        <p className="success-text text-purple-300 text-lg mb-2">
          Your donation helps keep Khushtrology written in the stars.
        </p>

        <p className="success-text text-sm mb-8 leading-relaxed text-yellow-300 italic">
          {blessing}
        </p>

        <div className="success-text flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/chart" className="btn-cosmic">
            View My Chart
          </Link>
          <Link to="/" className="btn-cosmic btn-gold">
            Back Home ✦
          </Link>
        </div>

        <p className="success-text text-xs text-purple-500 mt-8">
          Questions? Email us at{' '}
          <a href="mailto:hello@khushtrology.com" className="text-yellow-400 hover:underline">
            hello@khushtrology.com
          </a>
        </p>
      </div>
    </div>
  )
}
