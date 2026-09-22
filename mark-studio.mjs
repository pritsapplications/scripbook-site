// The studio mark: the wordmark compressed to fit 16 pixels.
//
// "prits.apps" is unreadable at favicon size, so it contracts to its initials
// and keeps the one element that identifies it, the accent separator: p.a
//
// Drawn as geometry rather than set in a typeface, because an SVG favicon is
// handed straight to the browser and can't carry a web font with it. A circle
// and a rectangle each make a lowercase p and a, which also gives them the
// constructed look the wordmark's grotesk already has.
export const BG = "#0E1014", INK = "#E9EBF0", ACCENT = "#5FE3C0";

// Natural units. Baseline at y=28, p descending to 44, ring stroke 8 so each
// bowl reads as outer radius 14 and inner 6.
const W = 70, H = 44, STEM = 8, R = 10, SW = 8;

export function markSvg(size = 64, { radius = 0.19, span = 0.66, bg = BG, ink = INK, accent = ACCENT } = {}) {
  const s = (size * span) / W;
  const ox = (size - W * s) / 2;
  const oy = (size - H * s) / 2;
  const n = (v) => (v * s).toFixed(3);
  const bar = (x, y, h) =>
    `<rect x="${(ox + x * s).toFixed(3)}" y="${(oy + y * s).toFixed(3)}" ` +
    `width="${n(STEM)}" height="${n(h)}" rx="${n(STEM / 2)}" fill="${ink}"/>`;
  const bowl = (cx) =>
    `<circle cx="${(ox + cx * s).toFixed(3)}" cy="${(oy + 14 * s).toFixed(3)}" ` +
    `r="${n(R)}" fill="none" stroke="${ink}" stroke-width="${n(SW)}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`
    + (bg === null ? "" : `<rect width="${size}" height="${size}" rx="${(size * radius).toFixed(3)}" fill="${bg}"/>`)
    + bar(0, 0, 44) + bowl(14)                                   // p, stem descending
    + `<circle cx="${(ox + 33 * s).toFixed(3)}" cy="${(oy + 25 * s).toFixed(3)}" `
    + `r="${n(4.4)}" fill="${accent}"/>`                         // the separator
    + bowl(52) + bar(62, 0, 28)                                  // a, stem on the baseline
    + `</svg>`;
}
