import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-purple-900/30 mt-20">
      <div className="max-w-screen-2xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <p className="font-serif text-xl gold-text mb-3">✦ Khushtrology</p>
          <p className="text-sm text-purple-300 leading-relaxed">
            AI-powered astrology readings rooted in ancient wisdom. Discover your
            cosmic blueprint.
          </p>
        </div>

        {/* Links */}
        <div>
          <p className="text-xs uppercase tracking-widest text-purple-400 mb-4">Navigate</p>
          <ul className="space-y-2">
            {[
              ['/', 'Home'],
              ['/chart', 'Calculate Chart'],
              ['/reading', 'AI Reading'],
              ['/transits', "Today's Sky"],
              ['/donate', 'Donate'],
              ['/about', 'About'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-sm text-purple-300 hover:text-yellow-300 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs uppercase tracking-widest text-purple-400 mb-4">Connect</p>
          <p className="text-sm text-purple-300">
            Questions? Reach me at{' '}
            <a
              href="mailto:khushigauli@gmail.com"
              className="text-yellow-400 hover:underline"
            >
              khushigauli@gmail.com
            </a>
          </p>
          <p className="text-xs text-purple-500 mt-6">
            © {new Date().getFullYear()} Khushtrology. For entertainment purposes.
          </p>
        </div>
      </div>
    </footer>
  )
}
