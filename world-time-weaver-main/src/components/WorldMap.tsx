import { TIMEZONES } from "@/lib/timezones";
import { WORLD_PATH } from "@/lib/world";

type Props = {
  selected: number[];
  onToggle: (offset: number) => void;
  hovered: number | null;
  onHover: (offset: number | null) => void;
};

const MAP_W = 720;
const MAP_H = 360;
const TZ_WIDTH = MAP_W / 24; // 30 units per timezone

export default function WorldMap({ selected, onToggle, hovered, onHover }: Props) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[hsl(var(--ocean))] p-3">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Interactive world map divided by timezone bands"
      >
        <defs>
          <linearGradient id="oceanGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(0 0% 7%)" />
            <stop offset="100%" stopColor="hsl(0 0% 4%)" />
          </linearGradient>
          <pattern id="tzgrid" width={TZ_WIDTH} height={MAP_H} patternUnits="userSpaceOnUse">
            <path
              d={`M ${TZ_WIDTH} 0 L ${TZ_WIDTH} ${MAP_H}`}
              stroke="hsl(0 0% 100% / 0.06)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        {/* Ocean */}
        <rect width={MAP_W} height={MAP_H} fill="url(#oceanGrad)" />

        {/* Accurate landmasses */}
        <path
          d={WORLD_PATH}
          fill="hsl(var(--land))"
          stroke="hsl(var(--land-foreground))"
          strokeWidth="0.4"
          fillRule="evenodd"
        />

        {/* Timezone grid */}
        <rect width={MAP_W} height={MAP_H} fill="url(#tzgrid)" />

        {/* Equator + Prime Meridian */}
        <line
          x1="0"
          x2={MAP_W}
          y1={MAP_H / 2}
          y2={MAP_H / 2}
          stroke="hsl(0 0% 100% / 0.08)"
          strokeDasharray="2 4"
          strokeWidth="0.5"
        />
        <line
          x1={MAP_W / 2}
          x2={MAP_W / 2}
          y1="0"
          y2={MAP_H}
          stroke="hsl(var(--primary) / 0.35)"
          strokeDasharray="2 4"
          strokeWidth="0.5"
        />

        {/* Timezone bands — interactive */}
        <g>
          {TIMEZONES.map((tz) => {
            const x = MAP_W / 2 + tz.offset * TZ_WIDTH - TZ_WIDTH / 2;
            const isSelected = selected.includes(tz.offset);
            const isHovered = hovered === tz.offset;
            return (
              <g
                key={tz.offset}
                onMouseEnter={() => onHover(tz.offset)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onToggle(tz.offset)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={0}
                  width={TZ_WIDTH}
                  height={MAP_H}
                  fill={
                    isSelected
                      ? "hsl(var(--tz-band-active) / 0.22)"
                      : isHovered
                      ? "hsl(var(--tz-band) / 0.14)"
                      : "transparent"
                  }
                  stroke={
                    isSelected
                      ? "hsl(var(--tz-band-active))"
                      : isHovered
                      ? "hsl(var(--tz-band) / 0.6)"
                      : "transparent"
                  }
                  strokeWidth="0.8"
                  className="transition-all duration-200"
                />
                {(isSelected || isHovered) && (
                  <text
                    x={x + TZ_WIDTH / 2}
                    y={14}
                    textAnchor="middle"
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                    fill="hsl(var(--foreground))"
                    fontWeight="600"
                  >
                    {tz.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/[0.07] bg-background/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Click a vertical band to add a timezone
      </div>
    </div>
  );
}

export { TIMEZONES };
