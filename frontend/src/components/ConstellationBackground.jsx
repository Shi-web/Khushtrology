const CLUSTERS = [
  { dots: [[5, 10], [15, 18], [28, 8], [38, 22], [50, 12]], edges: [[0, 1], [1, 2], [1, 3], [3, 4]] },
  { dots: [[70, 30], [82, 20], [92, 35], [78, 45]], edges: [[0, 1], [1, 2], [2, 3], [3, 0]] },
  { dots: [[10, 60], [22, 70], [18, 82], [32, 78], [40, 65]], edges: [[0, 1], [1, 2], [1, 3], [3, 4]] },
  { dots: [[60, 65], [72, 72], [85, 68], [88, 82], [65, 88]], edges: [[0, 1], [1, 2], [2, 3], [0, 4]] },
]

export default function ConstellationBackground() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {CLUSTERS.map((cluster, ci) => (
        <g key={ci} opacity="0.35">
          {cluster.edges.map(([a, b], ei) => (
            <line
              key={ei}
              x1={cluster.dots[a][0]} y1={cluster.dots[a][1]}
              x2={cluster.dots[b][0]} y2={cluster.dots[b][1]}
              stroke="var(--color-purple)"
              strokeWidth="0.15"
            />
          ))}
          {cluster.dots.map(([x, y], di) => (
            <circle key={di} cx={x} cy={y} r="0.5" fill="var(--color-gold)" />
          ))}
        </g>
      ))}
    </svg>
  )
}
