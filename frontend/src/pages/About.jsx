import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ConstellationBackground from '../components/ConstellationBackground'

export default function About() {
  const containerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(
      '.about-fade',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.15, delay: 0.2 }
    )
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen pt-28 pb-20 px-6 overflow-hidden">
      <ConstellationBackground />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <p className="about-fade text-sm uppercase tracking-widest text-purple-400 mb-2">
          ✦ My Story
        </p>
        <h1 className="about-fade font-serif text-4xl md:text-5xl font-bold mb-8">
          <span className="gold-text">About Khushtrology</span>
        </h1>

        <div className="about-fade glass p-8 text-left space-y-5 text-purple-200 leading-relaxed">
          <p>
            Long before satellites and ephemerides, our ancestors looked up and
            found stories written in the sky — a hunter, a scale, a pair of
            twins forever circling the pole. Khushtrology is built on the
            belief that those stories still speak, if you know how to read them.
          </p>
          <p>
            I pair the Swiss Ephemeris — the same precise planetary
            calculations used by professional astrologers — with AI readings
            powered by Groq, drawing on centuries of astrological tradition,
            to turn the exact moment of your birth into a chart, and that
            chart into a reading written just for you.
          </p>
          <p>
            Khushtrology is a passion project. I&rsquo;ve been fascinated by
            astrology ever since middle school — tracing zodiac signs in the
            margins of my notebooks and looking up friends&rsquo; birth charts
            long before I knew how to code. This site is where those two
            loves finally meet.
          </p>
          <p>
            No two charts are alike, and no two readings should be either.
            Khushtrology exists to make that kind of personal, careful
            astrology available to anyone curious enough to ask: what did the
            sky look like when I arrived?
          </p>
        </div>

        <p className="about-fade text-xs text-purple-500 mt-8">
          ✦ For entertainment and reflection — the stars suggest, they don&rsquo;t decide. ✦
        </p>
      </div>
    </div>
  )
}
