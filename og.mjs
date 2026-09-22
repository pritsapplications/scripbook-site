// Generates the Open Graph cards, the images that appear when a page is pasted
// into a message or a post. Rendered by headless Chrome via og.sh, same
// approach as the rest of the artwork: HTML in, PNG out, no dependency.
//
// Two cards, and deliberately two different designs. Each one reuses its own
// page's palette and motif so the preview looks like the page it links to.
// They used to share ScripBook's espresso-and-gold and ScripBook's calendar,
// which made a link to the studio look like a link to the app.
//
// Set in a system grotesk rather than the site's web fonts. Headless Chrome
// would have to fetch those over the network mid-render, and a card that
// depends on the network is a card that silently comes out in Times.
import fs from "fs";
import { markSvg } from "./mark-studio.mjs";

const STUDIO = process.argv.includes("--studio");

// --- ScripBook: warm, gold, the calendar ---------------------------------
const BG = "#241F14", SURF = "#332C1E", GOLD = "#E8C547", INK = "#F6F3EC";
const S_CELLS = [[0,0],[0,1],[0,2],[1,0],[2,0],[2,1],[2,2],[3,2],[4,0],[4,1],[4,2]];

// The app icon's S, so the card carries the same mark as the app itself.
const mark = (cell, gap, radius) => {
  let out = "";
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const lit = S_CELLS.some(([a, b]) => a === r && b === c - 1);
    const accent = r === 2 && c === 2;
    out += `<i style="background:${lit ? (accent ? "#FF7A45" : GOLD) : "rgba(232,197,71,.14)"};border-radius:${radius}px"></i>`;
  }
  return `<div class="mk" style="grid-template-columns:repeat(5,${cell}px);gap:${gap}px">${out}</div>`;
};

// The same month as the site's hero, at card scale.
const spend = {3:["#8B5A83"],5:["#5C7A52","#B54834"],9:["#3D6B87"],11:["#5C7A52"],
  16:["#B54834","#7A6A53"],18:["#5C7A52"],22:["#3D6B87","#8B5A83"],24:["#B54834"],27:["#5C7A52"]};
let days = "";
for (let d = 1; d <= 28; d++) {
  const bars = (spend[d] || []).map((c) => `<u style="background:${c}"></u>`).join("");
  days += `<div class="d"><s>${d}</s><div class="bars">${bars}</div></div>`;
}

const scripbook = `<meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:${BG};color:${INK};display:flex;align-items:center;gap:56px;padding:0 66px;
font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.mk{display:grid}
.mk i{display:block;width:100%;aspect-ratio:1}
.left{flex:1}
.brand{display:flex;align-items:center;gap:15px;margin-bottom:30px}
.brand span{font-size:29px;font-weight:800;letter-spacing:-.02em}
h1{font-size:66px;font-weight:800;letter-spacing:-.045em;line-height:.99}
h1 em{font-style:normal;color:${GOLD}}
p{margin-top:24px;font-size:25px;color:rgba(246,243,236,.62);letter-spacing:-.01em}
.cal{width:392px;flex:none;background:${SURF};border-radius:24px;padding:19px;
display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
.d{background:rgba(246,243,236,.07);border-radius:8px;aspect-ratio:.86;padding:5px;
display:flex;flex-direction:column}
.d s{text-decoration:none;font-size:11px;opacity:.7}
.bars{margin-top:auto;display:flex;gap:1.5px;border-radius:3px;overflow:hidden}
.bars u{height:5px;flex:1}
</style>
<div class="left">
  <div class="brand">${mark(17, 5, 4)}<span>ScripBook</span></div>
  <h1>Your money,<br>on a <em>calendar</em>.</h1>
  <p>Nothing leaves your phone. Free, no catch.</p>
</div>
<div class="cal">${days}</div>`;

// --- Studio: cool graphite, typographic, no cells -------------------------
// The card is the wordmark, which is the whole identity. The p.a tile on the
// right is the same drawing as the favicon, enlarged, so a link preview and a
// browser tab show the same thing.
const S_BG = "#0E1014", S_SURF = "#181B21", S_ACCENT = "#5FE3C0", S_INK = "#E9EBF0";

const studio = `<meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:${S_BG};color:${S_INK};display:flex;align-items:center;gap:72px;padding:0 74px;
font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.left{flex:1}
.word{font-size:27px;font-weight:700;letter-spacing:-.035em;opacity:.8;margin-bottom:34px}
.word i{font-style:normal;color:${S_ACCENT};opacity:1}
h1{font-size:68px;font-weight:700;letter-spacing:-.05em;line-height:1}
h1 em{font-style:normal;color:${S_ACCENT}}
p{margin-top:26px;font-size:24px;color:rgba(233,235,240,.58);letter-spacing:-.012em}
/* A single hairline rule instead of a second motif. The card needs one quiet
   mark of structure, and a grid of anything would read as ScripBook's cells. */
.rule{margin-top:34px;display:flex;gap:10px;align-items:center;
font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:rgba(233,235,240,.38)}
.rule b{flex:none;width:28px;height:1px;background:${S_ACCENT};opacity:.8}
.tile{width:300px;height:300px;flex:none;border-radius:44px;background:${S_SURF};
display:flex;align-items:center;justify-content:center}
.tile svg{width:300px;height:300px;display:block}
</style>
<div class="left">
  <div class="word">prits<i>.</i>apps</div>
  <h1>I build the apps<br>I <em>wanted to use</em>.</h1>
  <p>Small apps, made by one person.</p>
  <div class="rule"><b></b>pritsapps.com</div>
</div>
<div class="tile">${markSvg(300, { bg: null, span: 0.62 })}</div>`;

fs.mkdirSync("src", { recursive: true });
fs.writeFileSync(STUDIO ? "src/og-studio.html" : "src/og.html", STUDIO ? studio : scripbook);
console.log("wrote", STUDIO ? "src/og-studio.html" : "src/og.html");
