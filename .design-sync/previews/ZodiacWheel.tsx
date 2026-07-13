import { ZodiacWheel } from 'khushtrology-frontend';

export function Default() {
  return (
    <div style={{ background: 'var(--color-void)', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <ZodiacWheel />
    </div>
  );
}

export function NoStars() {
  return (
    <div style={{ background: 'var(--color-void-deep)', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <ZodiacWheel showStars={false} />
    </div>
  );
}

export function Static() {
  return (
    <div style={{ background: 'var(--color-void)', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <ZodiacWheel spin={false} />
    </div>
  );
}
