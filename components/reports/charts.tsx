import { formatNumber } from "@/lib/format";

export type ChartTone = "brand" | "success" | "warning" | "danger" | "info";

const TONE_COLOR: Record<ChartTone, string> = {
  brand: "var(--color-brand-600)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
};

const TONE_TEXT: Record<ChartTone, string> = {
  brand: "text-brand-700",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  label: string;
  value: number;
  tone: ChartTone;
}

export interface StackedPoint {
  label: string;
  segments: ChartSeries[];
}

interface ValueFormatProps {
  valueFormat?: (value: number) => string;
}

function resolveFormat(valueFormat?: (value: number) => string) {
  return valueFormat ?? formatNumber;
}

/* ------------------------------- Line ------------------------------- */

export function LineChart({
  data,
  tone = "brand",
  height = 220,
  valueFormat,
  emptyLabel = "Tidak ada data pada periode ini.",
}: {
  data: ChartPoint[];
  tone?: ChartTone;
  height?: number;
  emptyLabel?: string;
} & ValueFormatProps) {
  const format = resolveFormat(valueFormat);

  if (data.length === 0) {
    return <ChartPlaceholder label={emptyLabel} height={height} />;
  }

  const color = TONE_COLOR[tone];
  const max = Math.max(1, ...data.map((point) => point.value));

  const linePoints = data
    .map((point, index) => {
      const x = data.length <= 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 100 - (point.value / max) * 90;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full" style={{ height }}>
        <span className="absolute top-0 left-0 text-[10px] text-subtle">
          {format(max)}
        </span>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
        >
          {[0.25, 0.5, 0.75].map((grid) => (
            <line
              key={grid}
              x1={0}
              x2={100}
              y1={grid * 100}
              y2={grid * 100}
              stroke="var(--color-border)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <polygon
            points={`0,100 ${linePoints} 100,100`}
            fill={color}
            opacity={0.08}
          />
          <polyline
            points={linePoints}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0">
          {data.map((point, index) => {
            const left =
              data.length <= 1 ? 50 : (index / (data.length - 1)) * 100;
            const top = (1 - (point.value / max) * 0.9) * 100;
            return (
              <span
                key={`${point.label}-${index}`}
                title={`${point.label}: ${format(point.value)}`}
                className="pointer-events-auto absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-surface"
                style={{ left: `${left}%`, top: `${top}%`, backgroundColor: color }}
              />
            );
          })}
        </div>
      </div>
      <ChartAxis data={data} />
    </div>
  );
}

/* -------------------------------- Bar ------------------------------- */

export function BarChart({
  data,
  tone = "brand",
  height = 220,
  valueFormat,
  emptyLabel = "Tidak ada data pada periode ini.",
}: {
  data: ChartPoint[];
  tone?: ChartTone;
  height?: number;
  emptyLabel?: string;
} & ValueFormatProps) {
  const format = resolveFormat(valueFormat);

  if (data.length === 0) {
    return <ChartPlaceholder label={emptyLabel} height={height} />;
  }

  const color = TONE_COLOR[tone];
  const max = Math.max(1, ...data.map((point) => point.value));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((point, index) => (
          <div
            key={`${point.label}-${index}`}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            title={`${point.label}: ${format(point.value)}`}
          >
            <span className="text-[10px] text-muted tabular-nums">
              {format(point.value)}
            </span>
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-[56px] rounded-t-sm"
                style={{
                  height: `${(point.value / max) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 sm:gap-3">
        {data.map((point, index) => (
          <span
            key={`${point.label}-${index}`}
            title={point.label}
            className="min-w-0 flex-1 truncate text-center text-[10px] text-muted"
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Horizontal --------------------------- */

export function HorizontalBarChart({
  data,
  tone = "brand",
  valueFormat,
  emptyLabel = "Tidak ada data pada periode ini.",
}: {
  data: ChartPoint[];
  tone?: ChartTone;
  emptyLabel?: string;
} & ValueFormatProps) {
  const format = resolveFormat(valueFormat);

  if (data.length === 0) {
    return <ChartPlaceholder label={emptyLabel} height={160} />;
  }

  const color = TONE_COLOR[tone];
  const max = Math.max(1, ...data.map((point) => point.value));

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((point, index) => (
        <div key={`${point.label}-${index}`} className="flex items-center gap-3">
          <span
            title={point.label}
            className="w-28 shrink-0 truncate text-xs text-ink sm:w-40"
          >
            {point.label}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-sm bg-canvas">
            <div
              className="h-full rounded-sm"
              style={{
                width: `${(point.value / max) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="w-16 shrink-0 text-right text-xs text-muted tabular-nums">
            {format(point.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Stacked ----------------------------- */

export function StackedBarChart({
  data,
  height = 220,
  valueFormat,
  emptyLabel = "Tidak ada data pada periode ini.",
}: {
  data: StackedPoint[];
  height?: number;
  emptyLabel?: string;
} & ValueFormatProps) {
  const format = resolveFormat(valueFormat);

  if (data.length === 0) {
    return <ChartPlaceholder label={emptyLabel} height={height} />;
  }

  const totals = data.map((point) =>
    point.segments.reduce((sum, segment) => sum + segment.value, 0),
  );
  const max = Math.max(1, ...totals);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((point, index) => (
          <div
            key={`${point.label}-${index}`}
            className="flex min-w-0 flex-1 flex-col items-center"
          >
            <div className="flex w-full flex-1 items-end justify-center">
              <div className="flex w-full max-w-[56px] flex-col-reverse overflow-hidden rounded-t-sm">
                {point.segments.map((segment) => (
                  <div
                    key={segment.label}
                    title={`${point.label} · ${segment.label}: ${format(
                      segment.value,
                    )}`}
                    style={{
                      height: `${(segment.value / max) * 100}%`,
                      backgroundColor: TONE_COLOR[segment.tone],
                    }}
                  />
                ))}
              </div>
            </div>
            <span
              title={point.label}
              className="mt-2 w-full truncate text-center text-[10px] text-muted"
            >
              {point.label}
            </span>
          </div>
        ))}
      </div>
      <ChartLegend
        items={data[0].segments.map((segment) => ({
          label: segment.label,
          tone: segment.tone,
        }))}
      />
    </div>
  );
}

/* ------------------------------ Helpers ----------------------------- */

function ChartAxis({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) return null;
  const middle = data.length > 2 ? data[Math.floor((data.length - 1) / 2)] : null;

  return (
    <div className="flex justify-between text-[10px] text-muted">
      <span>{data[0].label}</span>
      {middle ? <span className="hidden sm:inline">{middle.label}</span> : null}
      <span>{data[data.length - 1].label}</span>
    </div>
  );
}

export function ChartLegend({
  items,
}: {
  items: { label: string; tone: ChartTone }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span
            aria-hidden
            className="size-2.5 rounded-sm"
            style={{ backgroundColor: TONE_COLOR[item.tone] }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ChartPlaceholder({
  label,
  height,
}: {
  label: string;
  height: number;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-md border border-dashed border-border-strong bg-panel px-4 text-center text-xs text-muted"
      style={{ height }}
    >
      {label}
    </div>
  );
}

export function chartToneText(tone: ChartTone) {
  return TONE_TEXT[tone];
}
