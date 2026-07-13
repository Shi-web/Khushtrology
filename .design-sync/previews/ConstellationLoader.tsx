import { ConstellationLoader } from 'khushtrology-frontend';

export function Default() {
  return (
    <div style={{ background: 'var(--color-void)', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minHeight: '200px' }}>
      <ConstellationLoader />
    </div>
  );
}

export function CustomLabel() {
  return (
    <div style={{ background: 'var(--color-void)', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minHeight: '200px' }}>
      <ConstellationLoader label="Calculating your birth chart…" />
    </div>
  );
}
