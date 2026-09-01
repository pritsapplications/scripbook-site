// Generates the Open Graph card, the image that appears when the site is
// pasted into a message or a post. Rendered by headless Chrome via og.sh,
// same approach as the rest of the artwork: HTML in, PNG out, no dependency.
//
// It reuses the hero palette and the drawn calendar so the preview looks like
// the page it links to rather than a generic banner.
import fs from "fs";

const BG = "#241F14", SURF = "#332C1E", GOLD = "#E8C547", INK = "#F6F3EC";
const S_CELLS = [[0,0],[0,1],[0,2],[1,0],[2,0],[2,1],[2,2],[3,2],[4,0],[4,1],[4,2]];

// The app icon's S, so the card carries the same mark as the app itself.
const mark = (cell, gap, radius) => {
  let out = "";
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const lit = S_CELLS.some(([a, b]) => a === r && b === c - 1);
    const accent = r === 2 && c === 3;
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

fs.mkdirSync("src", { recursive: true });
fs.writeFileSync("src/og.html", `<meta charset="utf-8"><style>
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
<div class="cal">${days}</div>`);
console.log("wrote src/og.html");
