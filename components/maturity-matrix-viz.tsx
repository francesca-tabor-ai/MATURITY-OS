'use client';

/** Interactive 2D matrix: X = Data Maturity Index (0-100), Y = AI Maturity Score (0-100). Marker for org position. */
export function MaturityMatrixViz({
  x,
  y,
  width = 320,
  height = 320,
  className = '',
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  className?: string;
}) {
  const padding = 40;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const cx = padding + (x / 100) * innerW;
  const cy = padding + (1 - y / 100) * innerH;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxWidth: width }}>
        <defs>
          <linearGradient id="matrix-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="rgb(168 85 247)" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect x={padding} y={padding} width={innerW} height={innerH} fill="url(#matrix-fill)" stroke="rgb(228 228 231)" strokeWidth="1" rx="4" />
        <line x1={padding} y1={padding + innerH / 2} x2={padding + innerW} y2={padding + innerH / 2} stroke="rgb(228 228 231)" strokeWidth="0.5" strokeDasharray="4" />
        <line x1={padding + innerW / 2} y1={padding} x2={padding + innerW / 2} y2={padding + innerH} stroke="rgb(228 228 231)" strokeWidth="0.5" strokeDasharray="4" />
        <text x={padding + innerW / 2} y={height - 8} textAnchor="middle" className="fill-zinc-500" style={{ fontSize: 10 }}>Data Maturity (0→100)</text>
        <text x={12} y={padding + innerH / 2} textAnchor="middle" transform={`rotate(-90, 12, ${padding + innerH / 2})`} className="fill-zinc-500" style={{ fontSize: 10 }}>AI Maturity (0→100)</text>
        <circle cx={cx} cy={cy} r="10" fill="rgb(99 102 241)" stroke="white" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="4" fill="white" />
      </svg>
    </div>
  );
}
