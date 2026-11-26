// Hand-rolled SVG charts for the Alvarez budget — no library, no canvas.
// Each function takes plain numbers and returns an SVG string the page
// drops into place. All charts carry text labels, so they still read
// when the picture does not load.

function money(n) {
  return "$" + n.toLocaleString("en-US");
}

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(cx, cy, rOuter, rInner, start, end) {
  const [x1, y1] = polar(cx, cy, rOuter, start);
  const [x2, y2] = polar(cx, cy, rOuter, end);
  const [x3, y3] = polar(cx, cy, rInner, end);
  const [x4, y4] = polar(cx, cy, rInner, start);
  const large = end - start > 180 ? 1 : 0;
  return [
    "M", x1.toFixed(2), y1.toFixed(2),
    "A", rOuter, rOuter, 0, large, 1, x2.toFixed(2), y2.toFixed(2),
    "L", x3.toFixed(2), y3.toFixed(2),
    "A", rInner, rInner, 0, large, 0, x4.toFixed(2), y4.toFixed(2),
    "Z",
  ].join(" ");
}

// Donut: how the month's spending splits across categories.
// slices: [{label, value, color}]. The centre shows the total.
export function donutChart(slices, total, size = 300) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 6;
  const rInner = rOuter - 44;
  let angle = 0;
  const parts = slices.map((s) => {
    const share = s.value / total;
    const start = angle;
    const end = angle + share * 360;
    angle = end;
    // A hairline gap between slices so neighbours stay distinct.
    const gap = 1.2;
    const d = arcPath(cx, cy, rOuter, rInner, start + gap / 2, Math.max(end - gap / 2, start + 0.5));
    return `<path d="${d}" fill="${s.color}"><title>${s.label}: ${money(s.value)} (${(share * 100).toFixed(1)}%)</title></path>`;
  });
  const legend = slices
    .map(
      (s) =>
        `<li><span class="swatch" style="background:${s.color}"></span>${s.label} — <strong>${money(s.value)}</strong> (${((s.value / total) * 100).toFixed(1)}%)</li>`,
    )
    .join("");
  return `<div class="chart-flex">
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Donut chart of spending by category, total ${money(total)}">
      ${parts.join("")}
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="donut-total">${money(total)}</text>
      <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-label">spent so far</text>
    </svg>
    <ul class="legend">${legend}</ul>
  </div>`;
}

// Grouped bars: budget (pale) against actual (solid) for each category.
export function budgetBars(rows, width = 640) {
  const barH = 20;
  const gap = 14;
  const labelW = 118;
  const valueW = 96;
  const height = rows.length * (barH * 2 + gap) + 30;
  const maxV = Math.max(...rows.flatMap((r) => [r.budget, r.actual])) * 1.12;
  const scale = (v) => (v / maxV) * (width - labelW - valueW);
  let y = 8;
  const parts = [];
  for (const r of rows) {
    parts.push(
      `<text x="0" y="${y + 15}" class="bar-label">${r.name}</text>`,
      `<rect x="${labelW}" y="${y}" width="${Math.max(scale(r.budget), 2).toFixed(1)}" height="${barH}" fill="#d8cdb8" rx="3"><title>${r.name} budget ${money(r.budget)}</title></rect>`,
      `<text x="${labelW + scale(r.budget) + 6}" y="${y + 15}" class="bar-value">${money(r.budget)}</text>`,
      `<rect x="${labelW}" y="${y + barH + 2}" width="${Math.max(scale(r.actual), 2).toFixed(1)}" height="${barH}" fill="${r.color}" rx="3"><title>${r.name} actual ${money(r.actual)}</title></rect>`,
      `<text x="${labelW + scale(r.actual) + 6}" y="${y + barH + 17}" class="bar-value bar-value-actual">${money(r.actual)}</text>`,
    );
    y += barH * 2 + gap;
  }
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="Budget against actual spending by category">
    ${parts.join("")}
  </svg>
  <p class="chart-key"><span class="key-pale"></span> Budget &nbsp; <span class="key-solid"></span> Actual spent</p>`;
}

// Line chart: income against spending across six months, with the
// savings rate under each month.
export function trendLines(points, width = 640) {
  const height = 260;
  const padL = 58;
  const padR = 14;
  const padT = 16;
  const padB = 44;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const maxV = Math.max(...points.flatMap((p) => [p.income, p.spending])) * 1.08;
  const x = (i) => padL + (i / (points.length - 1)) * innerW;
  const y = (v) => padT + innerH - (v / maxV) * innerH;
  const line = (key) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const v = maxV * f;
    const gy = y(v);
    return `<line x1="${padL}" y1="${gy}" x2="${width - padR}" y2="${gy}" class="grid-line"/><text x="${padL - 8}" y="${gy + 4}" text-anchor="end" class="axis-label">$${Math.round(v / 1000)}k</text>`;
  });
  const dots = points
    .map((p, i) => {
      // Edge labels anchor inward so they never run past the SVG's edge.
      const anchor = i === 0 ? "start" : i === points.length - 1 ? "end" : "middle";
      const tx = i === 0 ? padL : i === points.length - 1 ? width - padR : x(i);
      return (
        `<circle cx="${x(i)}" cy="${y(p.income)}" r="4" fill="#1e4d3a"><title>${p.month}: income ${money(p.income)}</title></circle>` +
        `<circle cx="${x(i)}" cy="${y(p.spending)}" r="4" fill="#c05b2e"><title>${p.month}: spending ${money(p.spending)}</title></circle>` +
        `<text x="${tx}" y="${height - 24}" text-anchor="${anchor}" class="axis-label">${p.month}</text>` +
        `<text x="${tx}" y="${height - 8}" text-anchor="${anchor}" class="axis-rate">${((p.income - p.spending) / p.income * 100).toFixed(0)}% kept</text>`
      );
    })
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="Line chart of income against spending, June to November 2026">
    ${grid.join("")}
    <path d="${line("income")}" fill="none" stroke="#1e4d3a" stroke-width="2.5"/>
    <path d="${line("spending")}" fill="none" stroke="#c05b2e" stroke-width="2.5"/>
    ${dots}
  </svg>
  <p class="chart-key"><span class="key-green"></span> Income &nbsp; <span class="key-terra"></span> Spending &nbsp;·&nbsp; % kept = income minus spending, as a share of income</p>`;
}
