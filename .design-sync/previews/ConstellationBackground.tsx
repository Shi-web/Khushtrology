import { ConstellationBackground } from 'khushtrology-frontend';

export function Default() {
  return (
    <div style={{ background: 'var(--color-void)', position: 'relative', width: '400px', height: '280px', overflow: 'hidden' }}>
      <ConstellationBackground />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)', fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '0.1em' }}>
        Constellation Background
      </div>
    </div>
  );
}
