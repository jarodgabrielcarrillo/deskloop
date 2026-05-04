import jsPDF from "jspdf";
import type { TZ } from "./timezones";

export type OverlapRow = {
  utcHour: number;
  isOverlap: boolean;
  perZone: { label: string; city: string; offset: number; iana?: string; localHour: number; inWork: boolean }[];
};

export function buildOverlap(zones: TZ[], workStart: number, workEnd: number): OverlapRow[] {
  const inRange = (h: number) =>
    workStart < workEnd ? h >= workStart && h < workEnd : h >= workStart || h < workEnd;

  return Array.from({ length: 24 }, (_, h) => {
    const perZone = zones.map((z) => {
      const local = ((h + z.offset) % 24 + 24) % 24;
      return { label: z.label, city: z.city, offset: z.offset, iana: z.iana, localHour: local, inWork: inRange(local) };
    });
    return { utcHour: h, isOverlap: perZone.length > 0 && perZone.every((p) => p.inWork), perZone };
  });
}

const offsetStr = (o: number) => {
  const sign = o >= 0 ? "+" : "−";
  const abs = Math.abs(o);
  const hh = Math.floor(abs);
  const mm = Math.round((abs - hh) * 60);
  return `UTC${sign}${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const fmt = (h: number) => `${String(h).padStart(2, "0")}:00`;
const today = () => new Date().toISOString().slice(0, 10);

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportCSV(zones: TZ[], workStart: number, workEnd: number) {
  const rows = buildOverlap(zones, workStart, workEnd);
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const zoneCol = (z: TZ) => `${z.city} (${offsetStr(z.offset)}${z.iana ? ` · ${z.iana}` : ""}) local`;
  const header = ["UTC Hour", "Overlap", ...zones.map((z) => esc(zoneCol(z)))];
  const lines: string[] = [];

  // Zone metadata block
  lines.push("# Zones");
  lines.push(["City", "UTC Offset", "IANA Timezone"].join(","));
  for (const z of zones) {
    lines.push([esc(z.city), esc(offsetStr(z.offset)), esc(z.iana ?? "")].join(","));
  }
  lines.push("");

  lines.push(header.join(","));
  for (const r of rows) {
    lines.push([
      fmt(r.utcHour),
      r.isOverlap ? "YES" : "",
      ...r.perZone.map((p) => `${fmt(p.localHour)}${p.inWork ? " *" : ""}`),
    ].join(","));
  }
  const overlapHours = rows.filter((r) => r.isOverlap).map((r) => fmt(r.utcHour));
  lines.push("");
  lines.push(`Working hours,${fmt(workStart)} - ${fmt(workEnd)}`);
  lines.push(`Overlap hours (UTC),${esc(overlapHours.join(", ") || "none")}`);
  download(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), `timezone-overlap-${today()}.csv`);
}

export function exportPDF(zones: TZ[], workStart: number, workEnd: number) {
  const rows = buildOverlap(zones, workStart, workEnd);
  const overlapHours = rows.filter((r) => r.isOverlap).map((r) => fmt(r.utcHour));

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Time Zone Overlap", margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Generated ${new Date().toLocaleString()} · deskloop.work`, margin, y);
  y += 18;
  doc.text(`Working hours: ${fmt(workStart)} – ${fmt(workEnd)} (local per zone)`, margin, y);
  y += 18;

  // Zone list
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Selected zones", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60);
  if (zones.length === 0) {
    doc.text("None.", margin, y);
    y += 14;
  } else {
    zones.forEach((z) => {
      const line = `• ${z.city} — ${offsetStr(z.offset)}${z.iana ? `  ·  ${z.iana}` : ""}`;
      doc.text(line, margin, y, { maxWidth: 500 });
      y += 13;
    });
  }
  y += 10;

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Overlap hours (UTC): ${overlapHours.length}`, margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(overlapHours.join(", ") || "No overlap with current settings.", margin, y, { maxWidth: 500 });
  y += 24;

  // Table
  const colW = [56, 50, ...zones.map(() => Math.min(80, (500 - 110) / Math.max(1, zones.length)))];
  const headers = ["UTC", "Overlap", ...zones.map((z) => `${offsetStr(z.offset)} ${z.city}`)];

  const drawRow = (cells: string[], opts: { header?: boolean; highlight?: boolean } = {}) => {
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    if (opts.highlight) {
      doc.setFillColor(232, 160, 32);
      doc.rect(margin, y - 10, colW.reduce((a, b) => a + b, 0), 14, "F");
      doc.setTextColor(0);
    } else if (opts.header) {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y - 10, colW.reduce((a, b) => a + b, 0), 14, "F");
      doc.setTextColor(20);
    } else {
      doc.setTextColor(40);
    }
    doc.setFont("helvetica", opts.header ? "bold" : "normal");
    let x = margin;
    cells.forEach((c, i) => {
      doc.text(c, x + 4, y);
      x += colW[i];
    });
    y += 14;
  };

  drawRow(headers, { header: true });
  rows.forEach((r) => {
    drawRow(
      [fmt(r.utcHour), r.isOverlap ? "YES" : "", ...r.perZone.map((p) => `${fmt(p.localHour)}${p.inWork ? "*" : ""}`)],
      { highlight: r.isOverlap },
    );
  });

  doc.save(`timezone-overlap-${today()}.pdf`);
}

export function exportHTML(zones: TZ[], workStart: number, workEnd: number) {
  const rows = buildOverlap(zones, workStart, workEnd);
  const overlapHours = rows.filter((r) => r.isOverlap).map((r) => fmt(r.utcHour));
  const esc = (s: string) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const zoneListHTML = zones
    .map(
      (z) =>
        `<li><strong>${esc(z.city)}</strong> — <span class="mono">${esc(offsetStr(z.offset))}</span>${
          z.iana ? ` <span class="mono muted">· ${esc(z.iana)}</span>` : ""
        }</li>`,
    )
    .join("");

  const headerCells = [
    `<th>UTC</th>`,
    `<th>Overlap</th>`,
    ...zones.map((z) => `<th>${esc(offsetStr(z.offset))}<br><span class="muted">${esc(z.city)}</span></th>`),
  ].join("");

  const bodyRows = rows
    .map((r) => {
      const cls = r.isOverlap ? ' class="overlap"' : "";
      const cells = [
        `<td class="mono">${fmt(r.utcHour)}</td>`,
        `<td class="mono">${r.isOverlap ? "YES" : ""}</td>`,
        ...r.perZone.map(
          (p) => `<td class="mono${p.inWork ? " work" : ""}">${fmt(p.localHour)}${p.inWork ? " *" : ""}</td>`,
        ),
      ].join("");
      return `<tr${cls}>${cells}</tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Time Zone Overlap — ${today()}</title>
<style>
  :root {
    --bg: #0b0d10; --card: #14171c; --border: #232830; --fg: #e7eaf0;
    --muted: #8a93a3; --primary: #ff8a3d; --overlap: #f4b740; --work: #2a3340;
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 20px; background: var(--bg); color: var(--fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; }
  .wrap { max-width: 1000px; margin: 0 auto; }
  h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 8px; }
  h2 { font-size: 16px; font-weight: 700; margin: 28px 0 10px; }
  .meta { color: var(--muted); font-size: 13px; margin-bottom: 8px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
  ul { margin: 0; padding-left: 20px; }
  li { margin: 4px 0; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .muted { color: var(--muted); }
  .overlap-list { color: var(--overlap); font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { padding: 6px 8px; text-align: center; border-bottom: 1px solid var(--border); }
  th { color: var(--muted); font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
  td.work { background: var(--work); }
  tr.overlap td { background: rgba(244, 183, 64, 0.18); color: var(--overlap); font-weight: 600; }
  tr.overlap td.work { background: rgba(244, 183, 64, 0.28); }
  footer { margin-top: 24px; color: var(--muted); font-size: 12px; text-align: center; }
  a { color: var(--primary); text-decoration: none; }
  @media print { body { background: white; color: black; } .card { background: white; border-color: #ddd; } }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Time Zone Overlap</h1>
    <div class="meta">Generated ${esc(new Date().toLocaleString())} · <a href="https://deskloop.work">deskloop.work</a></div>
    <div class="meta">Working hours: <span class="mono">${fmt(workStart)} – ${fmt(workEnd)}</span> (local per zone)</div>

    <div class="card">
      <h2 style="margin-top:0">Selected zones (${zones.length})</h2>
      ${zones.length ? `<ul>${zoneListHTML}</ul>` : `<p class="muted">None.</p>`}
    </div>

    <div class="card">
      <h2 style="margin-top:0">Overlap hours (UTC): ${overlapHours.length}</h2>
      <p class="overlap-list mono">${overlapHours.join(", ") || '<span class="muted">No overlap with current settings.</span>'}</p>
    </div>

    <div class="card">
      <h2 style="margin-top:0">24-hour breakdown</h2>
      <div style="overflow-x:auto"><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>
      <p class="muted" style="font-size:11px;margin-top:10px">* indicates the local hour falls within working hours for that zone.</p>
    </div>

    <footer>© ${new Date().getFullYear()} Deskloop.work — Free productivity tools</footer>
  </div>
</body>
</html>`;

  download(new Blob([html], { type: "text/html;charset=utf-8" }), `timezone-overlap-${today()}.html`);
}
