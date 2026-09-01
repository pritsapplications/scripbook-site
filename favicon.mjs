// Builds the favicon set from the same S grid as the app icon. Geometry and
// colors are copied from ScripBookApp/scripts/make-icons.mjs so the tab icon
// and the installed app are the same mark, not two drawings of one idea.
//
// Writes icon.svg, then favicon.sh rasterizes the PNG sizes and packs the .ico.
import fs from "fs";

const BG = "#16150F", GOLD = "#F2C230", DIM = "#6E6244", ACCENT = "#FF7A45";
const S_CELLS = [[0,0],[0,1],[0,2],[1,0],[2,0],[2,1],[2,2],[3,2],[4,0],[4,1],[4,2]];
const ACCENT_CELL = [2, 1];
const SHIFT = 1, GAP_RATIO = 0.30, GHOST = 0.18;

// A tab icon is 16px wide. The app can afford 72% because it is never that
// small, but here the mark is scaled up and the ground squared off, since
// every pixel of padding is one the S does not get.
const SCALE = 0.84;

function svg(size = 64, radius = 0.19) {
  const cw = (size * SCALE) / (5 + 4 * GAP_RATIO);
  const gap = cw * GAP_RATIO;
  const total = 5 * cw + 4 * gap;
  const o = (size - total) / 2;
  const r = cw * 0.24;
  let cells = "";
  for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
    const lit = S_CELLS.some(([a, b]) => a === row && b === col - SHIFT);
    const acc = ACCENT_CELL[0] === row && ACCENT_CELL[1] === col - SHIFT;
    const x = (o + col * (cw + gap)).toFixed(3);
    const y = (o + row * (cw + gap)).toFixed(3);
    const box = `x="${x}" y="${y}" width="${cw.toFixed(3)}" height="${cw.toFixed(3)}" rx="${r.toFixed(3)}"`;
    cells += lit
      ? `<rect ${box} fill="${acc ? ACCENT : GOLD}"/>`
      : `<rect ${box} fill="${DIM}" opacity="${GHOST}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`
    + `<rect width="${size}" height="${size}" rx="${(size * radius).toFixed(3)}" fill="${BG}"/>${cells}</svg>`;
}

fs.writeFileSync("icon.svg", svg(64));
fs.mkdirSync("src", { recursive: true });
fs.writeFileSync("src/favicon.html",
  `<meta charset="utf-8"><style>*{margin:0;padding:0}html,body{width:512px;height:512px;overflow:hidden}
   svg{display:block;width:512px;height:512px}</style>${svg(512)}`);
console.log("wrote icon.svg and src/favicon.html");
