import { Footer, MemoryRouter } from 'khushtrology-frontend';

export function Default() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <div style={{ background: 'var(--color-void)' }}>
        <Footer />
      </div>
    </MemoryRouter>
  );
}
