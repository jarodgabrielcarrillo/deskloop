import { useMemo, useState } from "react";
import WorldMap from "@/components/WorldMap";
import OverlapTimeline from "@/components/OverlapTimeline";
import { TIMEZONES, findTZ } from "@/lib/timezones";
import { Slider } from "@/components/ui/slider";
import { X, Download, FileText, Code } from "lucide-react";
import { exportCSV, exportPDF, exportHTML } from "@/lib/exportOverlap";

const Index = () => {
  const [selected, setSelected] = useState<number[]>([-8, 0, 8]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [workRange, setWorkRange] = useState<[number, number]>([9, 17]);

  const toggle = (offset: number) => {
    setSelected((prev) =>
      prev.includes(offset) ? prev.filter((o) => o !== offset) : [...prev, offset].sort((a, b) => a - b)
    );
  };

  const zones = useMemo(() => selected.map((o) => findTZ(o)), [selected]);

  const overlapHours = useMemo(() => {
    if (zones.length === 0) return 0;
    let count = 0;
    for (let h = 0; h < 24; h++) {
      const ok = zones.every((z) => {
        const local = ((h + z.offset) % 24 + 24) % 24;
        return workRange[0] < workRange[1]
          ? local >= workRange[0] && local < workRange[1]
          : local >= workRange[0] || local < workRange[1];
      });
      if (ok) count++;
    }
    return count;
  }, [zones, workRange]);

  return (
    <div className="relative">
      {/* Header — matches other Deskloop tools */}
      <header className="border-b border-white/[0.07]">
        <div className="mx-auto flex h-[60px] max-w-[960px] items-center justify-between px-4 sm:px-7">
          <a href="https://deskloop.work/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5">
                <circle cx="7" cy="7" r="4" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5"/>
                <circle cx="7" cy="7" r="1.5" fill="hsl(var(--primary-foreground))"/>
              </svg>
            </span>
            <span className="font-display text-[17px] font-bold tracking-tight">Deskloop</span>
          </a>
          <nav className="flex items-center gap-1">
            <a href="https://deskloop.work/#tools" className="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              Tools
            </a>
            <a href="https://deskloop.work/#about" className="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              About
            </a>
          </nav>
        </div>
      </header>

      <main className="relative z-[1]">
        <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-7 sm:py-14">

          {/* Page header — matches other Deskloop tools */}
          <div className="mb-8 sm:mb-10">
            <a href="https://deskloop.work/" className="inline-block text-[13px] text-[hsl(var(--text3))] transition hover:text-primary">
              ← All tools
            </a>
            <h1 className="mt-3 font-display text-[clamp(32px,5vw,44px)] font-extrabold leading-[1.1] tracking-[-0.02em]">
              Time Zone Overlap
            </h1>
            <p className="mt-2.5 max-w-[560px] text-[15px] leading-[1.6] text-muted-foreground">
              Click vertical bands on the world map to add time zones — find your team's best meeting window instantly.
            </p>
          </div>

          {/* Metrics */}
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="ZONES" value={String(zones.length)} />
            <Metric label="OVERLAP" value={`${overlapHours}h`} variant={overlapHours > 0 ? "success" : "danger"} />
            <Metric label="WORK START" value={`${String(workRange[0]).padStart(2, "0")}:00`} variant="accent" />
            <Metric label="WORK END" value={`${String(workRange[1]).padStart(2, "0")}:00`} variant="accent" />
          </div>

          {/* Map */}
          <div className="mb-4 rounded-2xl border border-white/[0.07] bg-card p-3 sm:p-5 md:p-9">
            <p className="mb-3 font-mono text-[12px] text-[hsl(var(--text3))]">// Click any timezone band to add it</p>
            <WorldMap selected={selected} onToggle={toggle} hovered={hovered} onHover={setHovered} />

            <div className="mt-5 flex flex-wrap gap-2">
              {zones.length === 0 && (
                <span className="text-sm italic text-[hsl(var(--text3))]">No time zones added — click a band on the map above</span>
              )}
              {zones.map((z) => (
                <button
                  key={z.offset}
                  onClick={() => toggle(z.offset)}
                  className="group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/[0.15]"
                >
                  <span className="font-mono text-primary">{z.label}</span>
                  <span>{z.city}</span>
                  <X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.07] bg-card p-5 md:p-9">
              <p className="mb-3 font-mono text-[12px] text-[hsl(var(--text3))]">// Working hours</p>
              <div className="mb-4 flex items-baseline justify-between">
                <span className="font-display text-[24px] font-extrabold tracking-tight">
                  {String(workRange[0]).padStart(2, "0")}:00 – {String(workRange[1]).padStart(2, "0")}:00
                </span>
              </div>
              <Slider
                min={0}
                max={24}
                step={1}
                value={workRange}
                onValueChange={(v) => setWorkRange([v[0], v[1]] as [number, number])}
                className="my-4"
              />
              <div className="flex justify-between font-mono text-[10px] text-[hsl(var(--text3))]">
                <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
              </div>
              <div className="mt-5 flex gap-2">
                {[
                  { l: "9–5", v: [9, 17] },
                  { l: "8–6", v: [8, 18] },
                  { l: "10–4", v: [10, 16] },
                ].map((p) => (
                  <button
                    key={p.l}
                    onClick={() => setWorkRange(p.v as [number, number])}
                    className="flex-1 rounded-md border border-white/[0.07] bg-muted px-3 py-2 text-[13px] font-medium text-muted-foreground transition hover:border-white/[0.12] hover:text-foreground"
                  >
                    {p.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-card p-5 md:p-9">
              <p className="mb-3 font-mono text-[12px] text-[hsl(var(--text3))]">// Quick add</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {TIMEZONES.filter((t) => !selected.includes(t.offset)).map((t) => (
                  <button
                    key={t.offset}
                    onClick={() => toggle(t.offset)}
                    onMouseEnter={() => setHovered(t.offset)}
                    onMouseLeave={() => setHovered(null)}
                    className="rounded-md border border-white/[0.07] bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground transition hover:border-primary/50 hover:bg-primary/[0.08] hover:text-foreground"
                  >
                    {t.label.replace("UTC", "")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-white/[0.07] bg-card p-3 sm:p-5 md:p-9">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[12px] text-[hsl(var(--text3))]">// 24-hour overlap grid</p>
              <div className="flex gap-2">
                <button
                  onClick={() => exportCSV(zones, workRange[0], workRange[1])}
                  disabled={zones.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-muted px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-primary/50 hover:bg-primary/[0.08] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" /> CSV
                </button>
                <button
                  onClick={() => exportHTML(zones, workRange[0], workRange[1])}
                  disabled={zones.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-muted px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-primary/50 hover:bg-primary/[0.08] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Code className="h-3.5 w-3.5" /> HTML
                </button>
                <button
                  onClick={() => exportPDF(zones, workRange[0], workRange[1])}
                  disabled={zones.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition hover:-translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FileText className="h-3.5 w-3.5" /> PDF
                </button>
              </div>
            </div>
            <OverlapTimeline zones={zones} workStart={workRange[0]} workEnd={workRange[1]} />
          </div>

          {/* SEO block */}
          <div className="mt-10 rounded-2xl border border-white/[0.07] bg-card p-5 md:p-9">
            <h2 className="mb-3.5 font-display text-[20px] font-extrabold tracking-tight">
              Interactive Timezone Map — Find Your Overlap
            </h2>
            <p className="mb-3 text-[14px] leading-[1.85] text-muted-foreground">
              The Deskloop Time Zone Overlap Finder renders a world map divided by UTC offset bands. Click any band to add a timezone, then instantly see which hours overlap for your entire team in the 24-hour grid below.
            </p>
            <p className="text-[14px] leading-[1.85] text-muted-foreground">
              Built for remote teams scheduling across continents. Free, no signup, fully client-side — no data ever leaves your browser.
            </p>
          </div>
        </div>

        {/* Footer — matches other Deskloop tools */}
        <footer className="border-t border-white/[0.07]">
          <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-between gap-2 px-4 py-8 text-[12px] text-[hsl(var(--text3))] sm:px-7">
            <span>© {new Date().getFullYear()} Deskloop.work — Free productivity tools</span>
            <span>No cookies · No tracking · No nonsense</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

function Metric({ label, value, variant }: { label: string; value: string; variant?: "accent" | "success" | "danger" }) {
  const color =
    variant === "accent" ? "text-primary"
    : variant === "success" ? "text-[hsl(var(--success))]"
    : variant === "danger" ? "text-destructive"
    : "text-foreground";
  return (
    <div className="rounded-[10px] border border-white/[0.07] bg-card px-5 py-[18px]">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-[hsl(var(--text3))]">
        {label}
      </div>
      <div className={`font-display text-[24px] font-extrabold tracking-tight ${color}`}>
        {value}
      </div>
    </div>
  );
}

export default Index;
