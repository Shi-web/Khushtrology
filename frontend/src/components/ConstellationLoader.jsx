import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const DOTS = [
  { x: 10, y: 50 }, { x: 35, y: 20 }, { x: 60, y: 38 },
  { x: 85, y: 15 }, { x: 100, y: 55 }, { x: 75, y: 70 },
  { x: 45, y: 75 },
]

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [2, 5],
]

function lineLength(a, b) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
}

export default function ConstellationLoader({ label = 'Reading the stars…' }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    const lines = svg.querySelectorAll('line')
    const dots  = svg.querySelectorAll('circle')

    // Set initial dash state on each line using its real length
    lines.forEach((line, i) => {
      const len = lineLength(DOTS[EDGES[i][0]], DOTS[EDGES[i][1]])
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 })
    })
    gsap.set(dots, { opacity: 0, scale: 0.5, transformOrigin: 'center center' })

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })

    // Draw dots in, then lines in sequence, then fade everything out
    tl.to(dots, {
      opacity: 1,
      scale: 1,
      duration: 0.25,
      stagger: 0.08,
      ease: 'back.out(2)',
    })

    lines.forEach((line, i) => {
      tl.to(line, { strokeDashoffset: 0, opacity: 0.55, duration: 0.4, ease: 'power2.out' }, `draw+=${i * 0.12}`)
    })

    tl.addLabel('draw', 0.5)

    tl.to([...lines, ...dots], {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      stagger: 0.04,
    }, '+=0.8')

    return () => tl.kill()
  }, [])

  return (
    <div className="constellation-loader">
      <svg ref={svgRef} viewBox="0 0 110 90" width="160" height="130" aria-hidden="true">
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={DOTS[a].x} y1={DOTS[a].y}
            x2={DOTS[b].x} y2={DOTS[b].y}
            stroke="var(--color-gold)"
            strokeWidth="0.6"
          />
        ))}
        {DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.x} cy={d.y} r="2.5"
            fill="var(--color-gold)"
          />
        ))}
      </svg>
      <p>{label}</p>
    </div>
  )
}
