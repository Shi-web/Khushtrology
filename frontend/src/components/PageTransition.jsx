import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'

export default function PageTransition({ children }) {
  const el = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'transform' }
      )
    })
    return () => ctx.revert()
  }, [pathname])

  return <div ref={el} style={{ opacity: 0 }}>{children}</div>
}
