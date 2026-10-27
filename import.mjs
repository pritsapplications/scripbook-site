// Builds the spreadsheet converter at pritsapps.com/scripbook/import/
// Run: node import.mjs
//
// Someone who already tracks spending in a spreadsheet is exactly ScripBook's
// audience, and until now the only way in was to type it all again. This turns
// a CSV into a ScripBook backup file they can import.
//
// Everything runs in the browser. The file is read with FileReader and never
// uploaded, which is the only version of this tool that is consistent with an
// app whose whole claim is that nothing leaves your device. It also means the
// page needs no server, which is why it can live on GitHub Pages.
//
// ScripBook's own look rather than the studio's, since it is a ScripBook tool.
import fs from "fs";

const BG = "#241F14", SURF = "#332C1E", GOLD = "#E8C547", INK = "#F6F3EC";
const FONT = fs.readFileSync(
  "../ScripBookApp/node_modules/@expo-google-fonts/fraunces/700Bold/Fraunces_700Bold.ttf"
).toString("base64");

// The app's own defaults, so an import lands on categories that already exist
// rather than inventing duplicates of them.
const DEFAULT_CATEGORIES = [
  { id: "work",       name: "Work",       color: "#3D6B87" },
  { id: "leisure",    name: "Leisure",    color: "#8B5A83" },
  { id: "fun",        name: "Fun",        color: "#B54834" },
  { id: "essentials", name: "Essentials", color: "#5C7A52" },
  { id: "other",      name: "Other",      color: "#7A6A53" },
];
const DEFAULT_SOURCES = [
  { id: "salary",       name: "Salary",    color: "#5C7A52" },
  { id: "freelance",    name: "Freelance", color: "#3D6B87" },
  { id: "gift",         name: "Gift",      color: "#8B5A83" },
  { id: "other-income", name: "Other",     color: "#7A6A53" },
];
const SWATCHES = ["#C9A24B","#4B6E5C","#9C4F6E","#2F5D7A","#8A6A2F",
                  "#6E4B8A","#8A4B4B","#4B8A7A","#8A7A4B","#5C5C8A"];

fs.mkdirSync("scripbook/import", { recursive: true });
fs.writeFileSync("scripbook/import/index.html", `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bring your spreadsheet to ScripBook</title>
<meta name="description" content="Turn a CSV from any spreadsheet into a ScripBook backup file. Runs entirely in your browser, nothing is uploaded.">
<meta name="theme-color" content="${BG}">
<link rel="canonical" href="https://pritsapps.com/scripbook/import/">
<link rel="icon" href="/scripbook/favicon.ico?v=2" sizes="32x32">
<link rel="icon" href="/scripbook/icon.svg?v=2" type="image/svg+xml">
<style>
@font-face{font-family:Fraunces;src:url(data:font/ttf;base64,${FONT}) format("truetype");font-weight:700;font-display:swap}
*{margin:0;padding:0;box-sizing:border-box}
body{background:${BG};color:${INK};min-height:100vh;padding:0 20px 90px;
font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
-webkit-font-smoothing:antialiased}
.wrap{max-width:820px;margin:0 auto}
header{padding:54px 0 34px}
a.back{color:${GOLD};text-decoration:none;font-size:14.5px;letter-spacing:.02em}
h1{font-family:Fraunces,Georgia,serif;font-size:clamp(31px,5.5vw,46px);line-height:1.08;
letter-spacing:-.025em;margin:16px 0 12px}
.lede{color:rgba(246,243,236,.66);max-width:62ch}
.privacy{margin-top:20px;padding:13px 16px;border-radius:12px;background:${SURF};
border:1px solid rgba(232,197,71,.2);font-size:14.5px;color:rgba(246,243,236,.76)}
.privacy b{color:${GOLD}}

.card{background:${SURF};border-radius:18px;padding:22px;margin-bottom:18px}
.card h2{font-family:Fraunces,Georgia,serif;font-size:21px;margin-bottom:6px;letter-spacing:-.01em}
.card p.hint{font-size:14.5px;color:rgba(246,243,236,.6);margin-bottom:16px}

.drop{border:2px dashed rgba(232,197,71,.38);border-radius:14px;padding:40px 20px;
text-align:center;cursor:pointer;transition:background .18s,border-color .18s}
.drop:hover,.drop.over{background:rgba(232,197,71,.07);border-color:${GOLD}}
.drop strong{display:block;font-size:17px;margin-bottom:6px}
.drop span{font-size:14px;color:rgba(246,243,236,.55)}
input[type=file]{display:none}

table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:7px 9px;border-bottom:1px solid rgba(246,243,236,.1)}
th{color:rgba(246,243,236,.5);font-weight:600;font-size:12.5px;text-transform:uppercase;letter-spacing:.07em}
td{color:rgba(246,243,236,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:190px}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}

.map{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}
label.f{display:block;font-size:13px;color:rgba(246,243,236,.6);margin-bottom:5px}
select,input[type=text]{width:100%;background:${BG};color:${INK};border:1px solid rgba(246,243,236,.18);
border-radius:9px;padding:10px 11px;font-size:15px;font-family:inherit}
select:focus,input:focus{outline:2px solid ${GOLD};outline-offset:1px}
.row{display:flex;align-items:center;gap:9px;margin-top:13px;font-size:14.5px;
color:rgba(246,243,236,.8)}
.row input[type=checkbox]{width:17px;height:17px;accent-color:${GOLD}}

button.go{background:${GOLD};color:${BG};border:0;border-radius:11px;
padding:14px 26px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit}
button.go:disabled{opacity:.4;cursor:not-allowed}
button.ghost{background:transparent;color:${INK};border:1px solid rgba(246,243,236,.26);
border-radius:11px;padding:13px 20px;font-size:15px;cursor:pointer;font-family:inherit}

.stat{display:flex;flex-wrap:wrap;gap:10px 26px;margin-bottom:14px;font-size:14.5px}
.stat div{color:rgba(246,243,236,.66)}
.stat b{color:${INK};font-weight:700}
.warn{margin-top:12px;padding:11px 14px;border-radius:10px;
background:rgba(181,72,52,.17);border:1px solid rgba(181,72,52,.45);font-size:14px}
.ok{background:rgba(92,122,82,.17);border-color:rgba(111,191,139,.45)}
.hidden{display:none}
.steps{counter-reset:s;list-style:none;margin-top:10px}
.steps li{counter-increment:s;position:relative;padding-left:32px;margin-bottom:9px;
font-size:14.5px;color:rgba(246,243,236,.76)}
.steps li::before{content:counter(s);position:absolute;left:0;top:1px;width:21px;height:21px;
border-radius:50%;background:rgba(232,197,71,.17);color:${GOLD};font-size:12px;font-weight:700;
display:flex;align-items:center;justify-content:center}
footer{margin-top:40px;font-size:13.5px;color:rgba(246,243,236,.42);text-align:center}
footer a{color:rgba(232,197,71,.8)}
</style></head>
<body><div class="wrap">

<header>
  <a class="back" href="/scripbook/">&larr; ScripBook</a>
  <h1>Bring your spreadsheet</h1>
  <p class="lede">If you already track spending in a spreadsheet, you should not have to type
  it all again. Export it as CSV, match up the columns, and this gives you back a ScripBook
  backup file you can import on your phone.</p>
  <div class="privacy"><b>Your file never leaves this page.</b> It is read in your browser and
  converted here. Nothing is uploaded, there is no server to upload it to, and you can turn off
  your connection before you start if you would rather prove it.</div>
</header>

<div class="card">
  <h2>1. Your CSV</h2>
  <p class="hint">From Excel, Numbers, Google Sheets or anything else. File, then Export or
  Download as CSV.</p>
  <div class="drop" id="drop">
    <strong>Choose a CSV file</strong>
    <span>or drag one here</span>
  </div>
  <input type="file" id="file" accept=".csv,text/csv">
  <div class="warn hidden" id="fileWarn"></div>
</div>

<div class="card hidden" id="previewCard">
  <h2>2. What we found</h2>
  <p class="hint" id="foundHint"></p>
  <div class="scroll"><table id="preview"></table></div>
</div>

<div class="card hidden" id="mapCard">
  <h2>3. Match the columns</h2>
  <p class="hint">Date and amount are required. The rest are optional.</p>
  <div class="map">
    <div><label class="f" for="colDate">Date</label><select id="colDate"></select></div>
    <div><label class="f" for="colAmount">Amount</label><select id="colAmount"></select></div>
    <div><label class="f" for="colCategory">Category</label><select id="colCategory"></select></div>
    <div><label class="f" for="colNote">Note or description</label><select id="colNote"></select></div>
    <div><label class="f" for="dateFmt">Date format</label><select id="dateFmt">
      <option value="auto">Detect automatically</option>
      <option value="mdy">Month / Day / Year</option>
      <option value="dmy">Day / Month / Year</option>
      <option value="ymd">Year-Month-Day</option>
    </select></div>
    <div><label class="f" for="signMode">Negative amounts</label><select id="signMode">
      <option value="expense">Are expenses too, just signed</option>
      <option value="income">Are income</option>
      <option value="skip">Should be skipped</option>
    </select></div>
  </div>
  <div class="row"><input type="checkbox" id="hasHeader" checked>
    <label for="hasHeader">The first row is column headings</label></div>
  <div class="warn hidden" id="mapWarn"></div>
  <div style="margin-top:20px;display:flex;gap:11px;flex-wrap:wrap">
    <button class="go" id="convert">Convert</button>
    <button class="ghost" id="reset">Start over</button>
  </div>
</div>

<div class="card hidden" id="resultCard">
  <h2>4. Your ScripBook file</h2>
  <div class="stat" id="stats"></div>
  <div class="warn ok" id="resultNote"></div>
  <div style="margin-top:18px"><button class="go" id="download">Download backup file</button></div>
  <ol class="steps">
    <li>Get the file onto your phone. AirDrop it, email it to yourself, or save it to Files or Drive.</li>
    <li>Open ScripBook, then Settings, then the Data tab.</li>
    <li>Tap Import and pick the file.</li>
    <li>Importing replaces what is already in the app, so export a backup first if you have
    entries you want to keep.</li>
  </ol>
</div>

<footer>
  <a href="/scripbook/">ScripBook</a> &middot; <a href="/">Prits Apps</a> &middot;
  <a href="/privacy/">Privacy</a>
</footer>
</div>

<script>
const DEFAULT_CATEGORIES = ${JSON.stringify(DEFAULT_CATEGORIES)};
const DEFAULT_SOURCES = ${JSON.stringify(DEFAULT_SOURCES)};
const SWATCHES = ${JSON.stringify(SWATCHES)};

let rows = [], built = null;
const $ = (id) => document.getElementById(id);

// --- CSV parsing ---------------------------------------------------------
// Written out rather than pulled from a library, because the page has to work
// with no network and no dependency. Handles quoted fields, escaped quotes and
// both line endings, which covers what spreadsheets actually export.
function parseCSV(text) {
  const out = [];
  let row = [], field = "", quoted = false;
  text = text.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\\n") { row.push(field); out.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); out.push(row); }
  return out.filter((r) => r.some((c) => c.trim() !== ""));
}

// --- parsing the values --------------------------------------------------
// Spreadsheets write money in every imaginable way. Currency symbols, thousands
// separators, and accounting style parentheses for negatives.
function parseAmount(raw) {
  if (raw == null) return NaN;
  let s = String(raw).trim();
  if (!s) return NaN;
  let neg = false;
  if (/^\\(.*\\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (s.startsWith("-")) { neg = true; s = s.slice(1); }
  s = s.replace(/[^0-9.,]/g, "");
  // If both separators appear, the last one is the decimal point.
  if (s.includes(",") && s.includes(".")) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".")
      ? s.replace(/\\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  } else if (s.includes(",")) {
    const p = s.split(",");
    s = (p.length === 2 && p[1].length <= 2) ? p.join(".") : s.replace(/,/g, "");
  }
  const n = parseFloat(s);
  return isNaN(n) ? NaN : (neg ? -n : n);
}

const pad = (n) => String(n).padStart(2, "0");
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

function parseDate(raw, fmt) {
  if (!raw) return null;
  const s = String(raw).trim();
  // Already ISO.
  let m = s.match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})/);
  if (m) return \`\${m[1]}-\${pad(m[2])}-\${pad(m[3])}\`;
  // Written month, "5 Jan 2026" or "Jan 5, 2026".
  m = s.match(/^([A-Za-z]{3,})\\s+(\\d{1,2}),?\\s+(\\d{4})$/);
  if (m) { const i = MONTHS.indexOf(m[1].slice(0,3).toLowerCase());
    if (i >= 0) return \`\${m[3]}-\${pad(i+1)}-\${pad(m[2])}\`; }
  m = s.match(/^(\\d{1,2})\\s+([A-Za-z]{3,}),?\\s+(\\d{4})$/);
  if (m) { const i = MONTHS.indexOf(m[2].slice(0,3).toLowerCase());
    if (i >= 0) return \`\${m[3]}-\${pad(i+1)}-\${pad(m[1])}\`; }
  // Numeric, separated by / . or -
  m = s.match(/^(\\d{1,4})[\\/.\\-](\\d{1,2})[\\/.\\-](\\d{1,4})$/);
  if (!m) return null;
  let [, a, b, c] = m.map(Number);
  let y, mo, d;
  if (String(m[1]).length === 4) { y = a; mo = b; d = c; }
  else if (fmt === "dmy") { d = a; mo = b; y = c; }
  else if (fmt === "ymd") { y = a; mo = b; d = c; }
  else { mo = a; d = b; y = c; }       // mdy, and the auto default
  if (y < 100) y += y < 70 ? 2000 : 1900;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return \`\${y}-\${pad(mo)}-\${pad(d)}\`;
}

// Guesses the format by looking for a value that can only be one thing: a
// first number above 12 has to be a day, which rules out month-first.
function detectFormat(values) {
  let dmy = 0, mdy = 0;
  for (const v of values) {
    const m = String(v).trim().match(/^(\\d{1,2})[\\/.\\-](\\d{1,2})[\\/.\\-]\\d{1,4}$/);
    if (!m) continue;
    if (+m[1] > 12) dmy++;
    else if (+m[2] > 12) mdy++;
  }
  return dmy > mdy ? "dmy" : "mdy";
}

const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x";
let seq = 0;
const uid = () => "csv" + (++seq).toString(36).padStart(4, "0");

// --- wiring --------------------------------------------------------------
$("drop").onclick = () => $("file").click();
["dragover","dragenter"].forEach((e) =>
  $("drop").addEventListener(e, (ev) => { ev.preventDefault(); $("drop").classList.add("over"); }));
["dragleave","drop"].forEach((e) =>
  $("drop").addEventListener(e, () => $("drop").classList.remove("over")));
$("drop").addEventListener("drop", (ev) => {
  ev.preventDefault();
  if (ev.dataTransfer.files[0]) read(ev.dataTransfer.files[0]);
});
$("file").onchange = (e) => { if (e.target.files[0]) read(e.target.files[0]); };

function warn(id, msg) {
  const el = $(id);
  if (!msg) { el.classList.add("hidden"); return; }
  el.textContent = msg; el.classList.remove("hidden");
}

function read(file) {
  warn("fileWarn", "");
  const r = new FileReader();
  r.onload = () => {
    rows = parseCSV(r.result);
    if (rows.length < 2) {
      warn("fileWarn", "That file has fewer than two rows, so there is nothing to convert. Make sure you exported as CSV rather than the spreadsheet's own format.");
      return;
    }
    showPreview(file.name);
  };
  r.onerror = () => warn("fileWarn", "That file could not be read.");
  r.readAsText(file);
}

function columnNames() {
  const header = $("hasHeader").checked;
  const width = Math.max(...rows.map((r) => r.length));
  return Array.from({ length: width }, (_, i) =>
    header && rows[0][i] ? rows[0][i].trim() : "Column " + (i + 1));
}

function showPreview(name) {
  const names = columnNames();
  const body = $("hasHeader").checked ? rows.slice(1) : rows;
  $("foundHint").textContent =
    \`\${name} · \${body.length} row\${body.length === 1 ? "" : "s"} · \${names.length} columns. First few rows:\`;
  const t = $("preview");
  t.innerHTML = "<tr>" + names.map((n) => "<th>" + esc(n) + "</th>").join("") + "</tr>" +
    body.slice(0, 5).map((r) =>
      "<tr>" + names.map((_, i) => "<td>" + esc(r[i] || "") + "</td>").join("") + "</tr>").join("");

  // Pre-select columns by name, since most exports label them recognizably.
  const guess = (want, fallback) => {
    const i = names.findIndex((n) => want.some((w) => n.toLowerCase().includes(w)));
    return i >= 0 ? i : fallback;
  };
  fillSelects(names);
  $("colDate").value     = guess(["date","day","when"], 0);
  $("colAmount").value   = guess(["amount","value","cost","price","debit","spent","total"], 1);
  $("colCategory").value = guess(["categ","type","group","tag"], -1);
  $("colNote").value     = guess(["note","desc","detail","memo","item","merchant","payee"], -1);

  $("previewCard").classList.remove("hidden");
  $("mapCard").classList.remove("hidden");
  $("resultCard").classList.add("hidden");
}

function fillSelects(names) {
  for (const id of ["colDate","colAmount","colCategory","colNote"]) {
    const sel = $(id);
    const optional = id === "colCategory" || id === "colNote";
    sel.innerHTML = (optional ? '<option value="-1">Not in my file</option>' : "") +
      names.map((n, i) => \`<option value="\${i}">\${esc(n)}</option>\`).join("");
  }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

$("hasHeader").onchange = () => { if (rows.length) showPreview($("foundHint").textContent.split(" ·")[0]); };
$("reset").onclick = () => {
  rows = []; built = null;
  ["previewCard","mapCard","resultCard"].forEach((i) => $(i).classList.add("hidden"));
  $("file").value = ""; warn("fileWarn",""); warn("mapWarn","");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

$("convert").onclick = () => {
  warn("mapWarn", "");
  const names = columnNames();
  const body = $("hasHeader").checked ? rows.slice(1) : rows;
  const ci = {
    date: +$("colDate").value, amount: +$("colAmount").value,
    category: +$("colCategory").value, note: +$("colNote").value,
  };
  if (ci.date === ci.amount) {
    warn("mapWarn", "Date and amount are set to the same column. Pick different ones.");
    return;
  }
  let fmt = $("dateFmt").value;
  if (fmt === "auto") fmt = detectFormat(body.map((r) => r[ci.date]));
  const signMode = $("signMode").value;

  const categories = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  const byName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const expenses = [], incomes = [];
  let badDate = 0, badAmount = 0, skipped = 0, newCats = 0;

  for (const r of body) {
    const date = parseDate(r[ci.date], fmt);
    if (!date) { badDate++; continue; }
    let amt = parseAmount(r[ci.amount]);
    if (isNaN(amt) || amt === 0) { badAmount++; continue; }

    const note = ci.note >= 0 ? String(r[ci.note] || "").trim().slice(0, 120) : "";
    const isIncome = amt < 0 && signMode === "income";
    if (amt < 0 && signMode === "skip") { skipped++; continue; }
    amt = Math.abs(Math.round(amt * 100) / 100);

    if (isIncome) {
      incomes.push({ id: uid(), date, amount: amt, sourceId: "other-income" });
      continue;
    }
    let categoryId = "other";
    if (ci.category >= 0) {
      const raw = String(r[ci.category] || "").trim();
      if (raw) {
        const key = raw.toLowerCase();
        if (byName.has(key)) categoryId = byName.get(key);
        else {
          const id = slug(raw);
          categoryId = id;
          categories.push({ id, name: raw.slice(0, 32),
            color: SWATCHES[newCats % SWATCHES.length] });
          byName.set(key, id);
          newCats++;
        }
      }
    }
    expenses.push({ id: uid(), date, amount: amt, categoryId, note });
  }

  if (!expenses.length && !incomes.length) {
    warn("mapWarn", "Nothing could be read from those columns. Check the date and amount selections, and try setting the date format by hand rather than leaving it on detect.");
    return;
  }

  expenses.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  incomes.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // The full shape the app's import expects. Appearance is left out on
  // purpose so importing does not overwrite the palette, font and shape
  // already chosen on the phone.
  built = {
    schemaVersion: 1,
    categories, expenses, incomes,
    incomeSources: DEFAULT_SOURCES.map((s) => ({ ...s })),
    recurringItems: [], skippedOccurrences: [], noSpendDays: [], activeDays: [],
    budgets: { overall: 0, byCategory: {} },
    currencyCode: "USD",
    heatmapEnabled: true, heatStyle: "classic", heatScale: "p85",
    amountsHidden: false, hasCompletedOnboarding: true, hasSeenIntro: true,
  };

  const dates = expenses.concat(incomes).map((e) => e.date).sort();
  $("stats").innerHTML = [
    ["Expenses", expenses.length], ["Income entries", incomes.length],
    ["Categories", categories.length],
    ["From", dates[0] || "n/a"], ["To", dates[dates.length - 1] || "n/a"],
  ].map(([k, v]) => \`<div>\${k} <b>\${v}</b></div>\`).join("");

  const notes = [];
  if (newCats) notes.push(\`\${newCats} new categor\${newCats === 1 ? "y" : "ies"} created from your file.\`);
  if (badDate) notes.push(\`\${badDate} row\${badDate === 1 ? "" : "s"} skipped, the date could not be read.\`);
  if (badAmount) notes.push(\`\${badAmount} row\${badAmount === 1 ? "" : "s"} skipped, the amount was empty or zero.\`);
  if (skipped) notes.push(\`\${skipped} negative row\${skipped === 1 ? "" : "s"} skipped as you asked.\`);
  notes.push("Dates were read as " + ({ dmy: "day first", mdy: "month first", ymd: "year first" }[fmt]) + ". If that is wrong, set the format by hand and convert again.");
  $("resultNote").innerHTML = notes.map(esc).join("<br>");

  $("resultCard").classList.remove("hidden");
  $("resultCard").scrollIntoView({ behavior: "smooth", block: "start" });
};

$("download").onclick = () => {
  if (!built) return;
  const blob = new Blob([JSON.stringify(built)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scripbook-import.json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
</script>
</body></html>`);
console.log("built scripbook/import/index.html");
