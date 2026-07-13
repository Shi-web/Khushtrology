import { StarLogo } from 'khushtrology-frontend';

export function Default() {
  return (
    <div style={{ background: 'var(--color-void)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <StarLogo size={16} />
      <StarLogo size={24} />
      <StarLogo size={36} />
      <StarLogo size={48} />
    </div>
  );
}

export function InContext() {
  return (
    <div style={{ background: 'var(--color-void)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <StarLogo size={26} />
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>
        Khushtrology
      </span>
    </div>
  );
}
