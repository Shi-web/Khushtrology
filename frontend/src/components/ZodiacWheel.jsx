import { forwardRef, useMemo, useState } from 'react'

const C = 200
const SEG_OUTER = 180, SEG_INNER = 82, GLYPH_R = 150, ELEM_R = 112, STAR_R = 190

const NAMES  = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const DATES  = ['Mar 21 – Apr 19','Apr 20 – May 20','May 21 – Jun 20','Jun 21 – Jul 22','Jul 23 – Aug 22','Aug 23 – Sep 22','Sep 23 – Oct 22','Oct 23 – Nov 21','Nov 22 – Dec 21','Dec 22 – Jan 19','Jan 20 – Feb 18','Feb 19 – Mar 20']
const GLYPHS = [
  'M0,9 L0,-1 M0,-1 C0,-7 -4,-9 -7,-7 C-9,-5.5 -8.5,-3 -6.5,-3.5 M0,-1 C0,-7 4,-9 7,-7 C9,-5.5 8.5,-3 6.5,-3.5',
  'M-5.5,3.5 a5.5,5.5 0 1,0 11,0 a5.5,5.5 0 1,0 -11,0 M-7,-5 C-4,0 4,0 7,-5',
  'M-4,-8 L-4,8 M4,-8 L4,8 M-7.5,-8 L7.5,-8 M-7.5,8 L7.5,8',
  'M-8,-1 C-8,-5 -3,-6 1,-5 M2.7,-3.2 a1.8,1.8 0 1,0 3.6,0 a1.8,1.8 0 1,0 -3.6,0 M8,1 C8,5 3,6 -1,5 M-6.3,3.2 a1.8,1.8 0 1,0 3.6,0 a1.8,1.8 0 1,0 -3.6,0',
  'M-7.1,4.5 a2.6,2.6 0 1,0 5.2,0 a2.6,2.6 0 1,0 -5.2,0 M-4.5,1.9 C-8,-3 -3,-9 2,-7 C6,-5.5 6,-1 3,0 C0.5,1 1,4 3.5,5 C5.5,5.8 7,4.5 7.5,2.8',
  'M-7,8 L-7,-3 C-7,-7 -2.5,-7 -2.5,-3 L-2.5,8 M-2.5,-3 C-2.5,-7 2,-7 2,-3 L2,8 C2,9.5 4.8,9.3 6,6.8 C7,4.7 3.2,3.2 1.4,5.6',
  'M-7,1 L-3.2,1 Q-2.4,1 -2.4,-1.6 Q-2.4,-3.4 -1.2,-3.4 L1.2,-3.4 Q2.4,-3.4 2.4,-1.6 Q2.4,1 3.2,1 L7,1 M-8,5 L8,5',
  'M-7,8 L-7,-3 C-7,-7 -2.5,-7 -2.5,-3 L-2.5,8 M-2.5,-3 C-2.5,-7 2,-7 2,-3 L2,6 L6.8,1.2 M6.8,1.2 L3.9,1.4 M6.8,1.2 L6.7,4.1',
  'M-7,7 L7,-7 M7,-7 L2.6,-6.2 M7,-7 L6.2,-2.6 M-2.5,-3.5 L3.5,2.5',
  'M-8,-2 C-8,-7 -3,-8 -3,-3 L-3,4 M-3,-3 C-1,-7 3,-7 4,-2 C4.7,1.5 2.5,3.5 0.5,2.5 C-1,1.7 -0.6,-0.5 1,-0.2 C2.6,0.1 2.8,2.6 1,3.8',
  'M-8,-3 L-4,-5 L0,-3 L4,-5 L8,-3 M-8,3 L-4,1 L0,3 L4,1 L8,3',
  'M-7,-7 C-3,-4 -3,4 -7,7 M7,-7 C3,-4 3,4 7,7 M-5.2,0 L5.2,0',
]

const f = n => n.toFixed(2)
const xy = (r, deg) => {
  const a = (deg - 90) * Math.PI / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
const starPoints = (cx, cy, rO, rI) => {
  const pts = []
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? rO : rI
    const a = (k * 36 - 90) * Math.PI / 180
    pts.push(`${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`)
  }
  return pts.join(' ')
}

function buildGeometry() {
  const segments = NAMES.map((name, i) => {
    const a0 = i * 30, a1 = a0 + 30, mid = a0 + 15
    const [ox0, oy0] = xy(SEG_OUTER, a0), [ox1, oy1] = xy(SEG_OUTER, a1)
    const [ix1, iy1] = xy(SEG_INNER, a1), [ix0, iy0] = xy(SEG_INNER, a0)
    const d = `M ${f(ox0)} ${f(oy0)} A ${SEG_OUTER} ${SEG_OUTER} 0 0 1 ${f(ox1)} ${f(oy1)} L ${f(ix1)} ${f(iy1)} A ${SEG_INNER} ${SEG_INNER} 0 0 0 ${f(ix0)} ${f(iy0)} Z`
    const [gx, gy] = xy(GLYPH_R, mid)
    const [ex, ey] = xy(ELEM_R, mid)
    const element = i % 4  // 0 fire, 1 earth, 2 air, 3 water
    const up = element === 0 || element === 2
    const hasBar = element === 1 || element === 2
    const s = 9
    const elemPts = up
      ? `${f(ex)},${f(ey - s)} ${f(ex - s * 0.87)},${f(ey + s * 0.5)} ${f(ex + s * 0.87)},${f(ey + s * 0.5)}`
      : `${f(ex)},${f(ey + s)} ${f(ex - s * 0.87)},${f(ey - s * 0.5)} ${f(ex + s * 0.87)},${f(ey - s * 0.5)}`
    const barY = up ? ey - 1.5 : ey + 1.5
    return { i, name, dates: DATES[i], d, gx, gy, ex, ey, glyphPath: GLYPHS[i], baseFill: i % 2 === 0 ? '#1a0f3c' : '#1f1447', elemPts, hasBar, barX1: f(ex - 4.4), barX2: f(ex + 4.4), barY: f(barY) }
  })

  const dividers = NAMES.map((_, i) => {
    const [x1, y1] = xy(SEG_INNER, i * 30), [x2, y2] = xy(SEG_OUTER, i * 30)
    return { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2) }
  })

  const ticks = []
  for (let deg = 0; deg < 360; deg += 5) {
    if (deg % 30 === 0) continue
    const [x1, y1] = xy(SEG_OUTER - 7, deg), [x2, y2] = xy(SEG_OUTER, deg)
    ticks.push({ x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2) })
  }

  const stars = []
  for (let i = 0; i < 24; i++) {
    const [x, y] = xy(STAR_R, i * 15)
    stars.push(starPoints(x, y, 4, 1.6))
  }

  const rays = []
  for (let i = 0; i < 8; i++) {
    const [x1, y1] = xy(20, i * 45), [x2, y2] = xy(32, i * 45)
    rays.push({ x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2) })
  }

  return { segments, dividers, ticks, stars, rays }
}

const ZodiacWheel = forwardRef(function ZodiacWheel({ spin = true, showStars = true }, ref) {
  const [hovered, setHovered] = useState(null)
  const geo = useMemo(buildGeometry, [])

  const hv = hovered != null ? geo.segments[hovered] : null

  return (
    <>
      <style>{`
        @keyframes zwh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes zwh-spin-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .zwh-rotate { animation: zwh-spin 60s linear infinite; transform-box: fill-box; transform-origin: center; }
        .zwh-sun { animation: zwh-spin-rev 120s linear infinite; transform-box: fill-box; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) { .zwh-rotate, .zwh-sun { animation: none; } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
        <svg
          ref={ref}
          viewBox="0 0 400 400"
          style={{ width: 'min(74vmin, 540px)', height: 'auto', display: 'block', overflow: 'visible' }}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="zwh-plate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1f1447" />
              <stop offset="68%" stopColor="#160d33" />
              <stop offset="100%" stopColor="#0f0922" />
            </radialGradient>
            <radialGradient id="zwh-copper" cx="50%" cy="42%" r="60%">
              <stop offset="0%" stopColor="#d4a843" stopOpacity="0.13" />
              <stop offset="55%" stopColor="#d4a843" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#d4a843" stopOpacity="0" />
            </radialGradient>
            <filter id="zwh-glow-soft" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.1" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="zwh-glow-strong" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <circle cx="200" cy="200" r="196" fill="url(#zwh-plate)" />
          <circle cx="200" cy="200" r="196" fill="url(#zwh-copper)" />

          <g className={spin ? 'zwh-rotate' : ''}>
            {/* Segment fills */}
            {geo.segments.map(s => (
              <path
                key={s.i}
                d={s.d}
                fill={hovered === s.i ? '#2a1a5c' : s.baseFill}
                stroke="#d4a843"
                strokeWidth="0.35"
                strokeOpacity="0.55"
              />
            ))}

            {/* Guide circles */}
            <circle cx="200" cy="200" r="180" fill="none" stroke="#d4a843" strokeWidth="0.5" strokeOpacity="0.45" />
            <circle cx="200" cy="200" r="130" fill="none" stroke="#d4a843" strokeWidth="0.45" strokeOpacity="0.30" />
            <circle cx="200" cy="200" r="96" fill="none" stroke="#4a9b8e" strokeWidth="0.45" strokeOpacity="0.30" />
            <circle cx="200" cy="200" r="82" fill="none" stroke="#d4a843" strokeWidth="0.5" strokeOpacity="0.45" />

            {/* 30° dividers */}
            {geo.dividers.map((dv, i) => (
              <line key={i} x1={dv.x1} y1={dv.y1} x2={dv.x2} y2={dv.y2} stroke="#d4a843" strokeWidth="0.6" strokeOpacity="0.7" />
            ))}

            {/* 5° ticks */}
            {geo.ticks.map((tk, i) => (
              <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2} stroke="#d4a843" strokeWidth="0.4" strokeOpacity="0.4" />
            ))}

            {/* Element symbols */}
            {geo.segments.map(s => (
              <g key={`elem-${s.i}`} style={{ pointerEvents: 'none' }}>
                <polygon points={s.elemPts} fill="none" stroke="#4a9b8e" strokeWidth="0.8" strokeOpacity="0.55" />
                {s.hasBar && (
                  <line x1={s.barX1} y1={s.barY} x2={s.barX2} y2={s.barY} stroke="#4a9b8e" strokeWidth="0.8" strokeOpacity="0.55" />
                )}
              </g>
            ))}

            {/* Glyphs with hover */}
            {geo.segments.map(s => {
              const on = hovered === s.i
              return (
                <g
                  key={`glyph-${s.i}`}
                  onMouseEnter={() => setHovered(s.i)}
                  onMouseLeave={() => setHovered(h => h === s.i ? null : h)}
                  style={{ cursor: 'pointer' }}
                >
                  <path d={s.d} fill="transparent" />
                  <g
                    transform={`translate(${s.gx}, ${s.gy}) scale(${on ? 1.16 : 0.96})`}
                    style={{ pointerEvents: 'none', transformBox: 'fill-box', transformOrigin: 'center' }}
                  >
                    <path
                      d={s.glyphPath}
                      fill="none"
                      stroke={on ? '#f4d896' : '#d4a843'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter={on ? 'url(#zwh-glow-strong)' : 'url(#zwh-glow-soft)'}
                    />
                  </g>
                </g>
              )
            })}

            {/* Star ring */}
            {showStars && geo.stars.map((pts, i) => (
              <polygon key={i} points={pts} fill="#c4847a" fillOpacity="0.85" />
            ))}
          </g>

          {/* Static double border */}
          <circle cx="200" cy="200" r="187" fill="none" stroke="#d4a843" strokeWidth="0.75" strokeOpacity="0.7" />
          <circle cx="200" cy="200" r="183" fill="none" stroke="#d4a843" strokeWidth="0.5" strokeOpacity="0.45" />

          {/* Counter-rotating sun */}
          <g className={spin ? 'zwh-sun' : ''}>
            {geo.rays.map((ray, i) => (
              <line key={i} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} stroke="#d4a843" strokeWidth="1" strokeOpacity="0.85" />
            ))}
            <circle cx="200" cy="200" r="17" fill="none" stroke="#d4a843" strokeWidth="1.4" filter="url(#zwh-glow-soft)" />
            <circle cx="200" cy="200" r="3.4" fill="#d4a843" />
          </g>
        </svg>

        {/* Hover tooltip */}
        <div style={{ minHeight: '56px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '0.06em', color: 'var(--color-gold)' }}>
            {hv ? hv.name : 'Twelve Signs'}
          </div>
          <div style={{ fontFamily: 'var(--font-label)', fontSize: '15px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
            {hv ? hv.dates : 'Hover a constellation'}
          </div>
        </div>
      </div>
    </>
  )
})

export default ZodiacWheel
