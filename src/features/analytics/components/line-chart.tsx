export type ChartPoint = {
  date: string;
  value: number;
};

/**
 * A server-rendered line chart.
 *
 * No charting dependency is installed, and three static series do not justify
 * one. The SVG scales to its container, uses the brand tokens for stroke and
 * grid, and exposes a text summary for readers who cannot interpret the line.
 * The numeric table beside each chart is the accessible alternative, not a
 * tooltip-only interaction.
 */
export function LineChart({
  points,
  formatValue,
  formatDate,
  summary,
  tone = "brand",
  height = 200,
}: {
  points: readonly ChartPoint[];
  formatValue: (value: number) => string;
  formatDate: (iso: string) => string;
  summary: string;
  tone?: "brand" | "chain";
  height?: number;
}) {
  const reactId = `chart-${tone}-${summary.length}-${summary.charCodeAt(0) || 0}`;
  const gradientId = reactId.replace(/[^a-zA-Z0-9-]/g, "");
  const stroke =
    tone === "chain" ? "var(--inverge-chain)" : "var(--inverge-brand)";
  const width = 640;
  const padding = { top: 16, right: 14, bottom: 28, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  if (points.length < 2) {
    return (
      <div className="grid h-48 place-items-center rounded-xl border border-dashed border-border bg-canvas text-center">
        <p className="max-w-xs px-4 text-xs leading-5 text-muted">
          Not enough history yet to draw a trend. Daily snapshots start after
          the idea is published.
        </p>
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const max = Math.max(...values);
  const ceiling = max <= 0 ? 1 : max * 1.08;
  const xFor = (index: number) =>
    padding.left + (index / (points.length - 1)) * plotWidth;
  const yFor = (value: number) =>
    padding.top + (1 - value / ceiling) * plotHeight;

  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${xFor(index).toFixed(2)},${yFor(point.value).toFixed(2)}`,
    )
    .join(" ");
  const area = `${line} L${xFor(points.length - 1).toFixed(2)},${(padding.top + plotHeight).toFixed(2)} L${padding.left},${(padding.top + plotHeight).toFixed(2)} Z`;

  const tickCount = 4;
  const ticks = Array.from(
    { length: tickCount + 1 },
    (_, index) => ceiling * (index / tickCount),
  );
  const labelIndices = [
    0,
    Math.floor((points.length - 1) / 3),
    Math.floor(((points.length - 1) * 2) / 3),
    points.length - 1,
  ];
  const lastPoint = points[points.length - 1];

  return (
    <figure className="min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={summary}
      >
        <title>{summary}</title>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="var(--inverge-border)"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 3.5}
                textAnchor="end"
                className="fill-[var(--inverge-muted)] text-[10px]"
              >
                {formatValue(tick)}
              </text>
            </g>
          );
        })}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={xFor(points.length - 1)}
          cy={yFor(lastPoint?.value ?? 0)}
          r="3.6"
          fill="var(--inverge-surface)"
          stroke={stroke}
          strokeWidth="2.2"
        />

        {labelIndices.map((index) => {
          const point = points[index];
          if (!point) return null;
          return (
            <text
              key={index}
              x={xFor(index)}
              y={height - 6}
              textAnchor={
                index === 0
                  ? "start"
                  : index === points.length - 1
                    ? "end"
                    : "middle"
              }
              className="fill-[var(--inverge-muted)] text-[10px]"
            >
              {formatDate(point.date)}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}
