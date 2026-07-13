export default function StarLogo({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="star-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.5 L14.4 9.2 L22 12 L14.4 14.8 L12 22.5 L9.6 14.8 L2 12 L9.6 9.2 Z"
        fill="url(#star-logo-gradient)"
      />
    </svg>
  )
}
