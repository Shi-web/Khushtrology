import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../lib/api'

const PRESET_AMOUNTS = [5, 15, 33]

export default function Donate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('15')
  const [donorName, setDonorName] = useState('')
  const [total, setTotal] = useState(null)
  const cardRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 }
    )

    api.get('/donations/total')
      .then(res => setTotal(res.data.total))
      .catch(() => setTotal(null))
  }, [])

  const handleDonate = async () => {
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter an amount greater than $0.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/donate/create-checkout-session', {
        amount: Math.round(parsedAmount * 100),
        donor_name: donorName.trim() || 'Anonymous',
      })
      window.location.href = res.data.url
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start checkout.')
      setLoading(false)
    }
  }

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-purple-400 mb-2">
            ✦ Support the Project
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            <span className="gold-text">Fuel the Cosmos</span>
          </h1>
          <p className="text-purple-300 text-lg max-w-xl mx-auto">
            Khushtrology is free to use. If a reading moved you, consider leaving
            a small donation to help keep it running.
          </p>
          {total !== null && (
            <p className="text-sm text-purple-400 mt-4">
              ✦ <span className="text-yellow-400 font-medium">${(total / 100).toFixed(2)}</span> raised in demo donations
            </p>
          )}
        </div>

        <div
          ref={cardRef}
          className="glass p-8 text-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(13,5,31,0.9) 100%)',
          }}
        >
          <p className="text-xs uppercase tracking-widest text-purple-400 mb-3">
            Choose your amount
          </p>
          <div className="flex justify-center gap-2 mb-4">
            {PRESET_AMOUNTS.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                  amount === String(a)
                    ? 'border-amber-400 text-amber-300 bg-amber-400/10'
                    : 'border-purple-500/30 text-purple-300 hover:border-purple-400'
                }`}
              >
                ${a}
              </button>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-center gap-1">
            <span className="font-serif text-5xl font-bold gold-text">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="font-serif text-6xl font-bold gold-text bg-transparent w-32 text-center outline-none border-b border-purple-500/30 focus:border-amber-400"
            />
            <span className="text-purple-400 text-sm ml-1 self-end mb-2">USD</span>
          </div>

          <div className="mb-6 text-left">
            <label className="block text-xs uppercase tracking-widest text-purple-400 mb-1">
              Your Name <span className="text-purple-500">(optional)</span>
            </label>
            <input
              value={donorName}
              onChange={e => setDonorName(e.target.value)}
              placeholder="Anonymous"
              className="input-cosmic"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
              ⚠ {error}
            </p>
          )}

          <button
            onClick={handleDonate}
            disabled={loading}
            className="btn-cosmic btn-gold w-full text-base mb-4 disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : `Donate $${amount || '0'} ✦`}
          </button>

          <p className="text-xs text-purple-500">
            Secured by Stripe · One-time donation
          </p>

          <p className="text-xs text-amber-300/80 border border-amber-400/30 bg-amber-400/5 p-3 mt-4">
            ✦ Demo mode — payments run on Stripe&apos;s test system, so no real money
            changes hands. To try the flow, use card{' '}
            <span className="font-mono text-amber-200">4242 4242 4242 4242</span>{' '}
            with any future expiry and CVC. Real cards will be declined.
          </p>
        </div>
      </div>
    </div>
  )
}
