import { Navbar, MemoryRouter } from 'khushtrology-frontend';

export function Default() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <div style={{ background: 'var(--color-void)', minHeight: '80px', position: 'relative' }}>
        <Navbar />
      </div>
    </MemoryRouter>
  );
}

export function Scrolled() {
  return (
    <MemoryRouter initialEntries={['/chart']}>
      <div style={{ background: 'var(--color-void)', minHeight: '80px', position: 'relative' }}>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'rgba(26,15,60,0.95)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(212,168,67,0.15)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              <path d="M12 1.5 L14.4 9.2 L22 12 L14.4 14.8 L12 22.5 L9.6 14.8 L2 12 L9.6 9.2 Z" fill="url(#sg)" />
            </svg>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>
              Khushtrology
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {['Home', 'Read My Chart', 'Donate ✦', 'About'].map((label, i) => (
              <span key={label} style={{ fontSize: '0.875rem', fontWeight: 500, color: i === 1 ? '#facc15' : i === 2 ? '#fbbf24' : 'rgb(233,213,255)' }}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ height: '80px' }} />
      </div>
    </MemoryRouter>
  );
}
