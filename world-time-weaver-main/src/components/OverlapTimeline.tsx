import { fmtHour, localHour, type TZ } from "@/lib/timezones";
import { cn } from "@/lib/utils";

type Props = {
  zones: TZ[];
  workStart: number; // local hour
  workEnd: number;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Determine if a UTC hour is within work range for a given offset
const isWorking = (utcH: number, offset: number, ws: number, we: number) => {
  const local = localHour(utcH, offset);
  if (ws < we) return local >= ws && local < we;
  // wraps midnight
  return local >= ws || local < we;
};

export default function OverlapTimeline({ zones, workStart, workEnd }: Props) {
  const overlapByHour = HOURS.map((h) =>
    zones.length > 0 && zones.every((z) => isWorking(h, z.offset, workStart, workEnd))
  );
  const totalOverlap = overlapByHour.filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-3 backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Overlap Timeline</h2>
          <p className="text-xs text-muted-foreground">
            Working hours {fmtHour(workStart)} – {fmtHour(workEnd)} local. Highlighted columns work for everyone.
          </p>
        </div>
        <div className="font-mono text-sm">
          <span className="text-muted-foreground">overlap </span>
          <span className={cn("font-semibold", totalOverlap > 0 ? "text-tz-band-overlap" : "text-destructive")}>
            {totalOverlap}h
          </span>
        </div>
      </div>

      {zones.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          Select timezones on the map to see overlap.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            {/* UTC hour header */}
            <div className="mb-1 grid" style={{ gridTemplateColumns: `80px repeat(24, minmax(0,1fr))` }}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">UTC</div>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className={cn(
                    "text-center font-mono text-[10px] text-muted-foreground",
                    overlapByHour[h] && "text-tz-band-overlap font-semibold"
                  )}
                >
                  {String(h).padStart(2, "0")}
                </div>
              ))}
            </div>

            {/* Overlap row */}
            <div className="mb-3 grid" style={{ gridTemplateColumns: `80px repeat(24, minmax(0,1fr))` }}>
              <div className="text-[11px] font-medium text-muted-foreground">All overlap</div>
              {HOURS.map((h) => (
                <div key={h} className="px-[1px]">
                  <div
                    className={cn(
                      "h-2 rounded-sm transition-colors",
                      overlapByHour[h]
                        ? "bg-tz-band-overlap shadow-[0_0_10px_hsl(var(--tz-band-overlap))]"
                        : "bg-secondary/60"
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Per-zone rows */}
            <div className="space-y-2">
              {zones.map((z) => (
                <div
                  key={z.offset}
                  className="grid items-center animate-fade-in"
                  style={{ gridTemplateColumns: `80px repeat(24, minmax(0,1fr))` }}
                >
                  <div className="pr-2">
                    <div className="truncate text-sm font-medium">{z.city}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{z.label}</div>
                    {z.iana && (
                      <div className="truncate font-mono text-[9px] text-muted-foreground/70" title={z.iana}>
                        {z.iana}
                      </div>
                    )}
                  </div>
                  {HOURS.map((h) => {
                    const lh = localHour(h, z.offset);
                    const work = isWorking(h, z.offset, workStart, workEnd);
                    const allOverlap = overlapByHour[h];
                    const isNight = lh < 6 || lh >= 22;
                    return (
                      <div key={h} className="px-[1px]">
                        <div
                          className={cn(
                            "flex h-7 items-center justify-center rounded-sm font-mono text-[9px] transition-colors",
                            allOverlap
                              ? "bg-tz-band-overlap/90 text-primary-foreground"
                              : work
                              ? "bg-tz-band/70 text-primary-foreground"
                              : isNight
                              ? "bg-secondary/40 text-muted-foreground/60"
                              : "bg-secondary/70 text-muted-foreground"
                          )}
                          title={`UTC ${String(h).padStart(2, "0")}:00 → ${z.city} ${fmtHour(lh)}`}
                        >
                          {String(Math.floor(lh)).padStart(2, "0")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
