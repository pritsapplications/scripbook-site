// Builds the studio home at pritsapps.com. Run: node studio.mjs
//
// Deliberately not ScripBook. ScripBook owns warm gold, a serif, and the cell
// grid, and the studio borrowing all three made both look like the same
// product. So the studio is the opposite on every axis: cool graphite instead
// of warm espresso, a grotesk and a mono instead of Fraunces, and a
// typographic mark instead of cells. Cells appear once, inside ScripBook's own
// section, as a preview of the product rather than as studio identity.
//
// What carries over is the mechanic, not the look: full-viewport sections, the
// palette repainting as you travel, and the progress bar.
import fs from "fs";
import { markSvg } from "./mark-studio.mjs";

const SITE = "https://pritsapps.com/";
const ACCENT = process.env.ACCENT || "#5FE3C0";   // the one color the studio owns
const OUT = process.env.OUT || "index.html";

// A tonal run through neutrals rather than a tour of other people's palettes.
// Each app's own colour appears only as an accent, never as the ground.
const P = {
  ink:   { bg:"#0E1014", surf:"#181B21", accent:ACCENT,   ink:"#E9EBF0" },
  slate: { bg:"#13161B", surf:"#1D2128", accent:"#E8C547", ink:"#E9EBF0" },  // ScripBook
  bone:  { bg:"#F3F2EF", surf:"#E7E5E0", accent:"#A93F24", ink:"#191817" },  // Hit 50
  coal:  { bg:"#08090B", surf:"#121418", accent:ACCENT,   ink:"#E9EBF0" },
};
const muted = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, .58)`;
};
const attrs = (k) =>
  `data-bg="${P[k].bg}" data-surf="${P[k].surf}" data-accent="${P[k].accent}" ` +
  `data-ink="${P[k].ink}" data-muted="${muted(P[k].ink)}"`;

// The mark is the name, set properly. The separator is the whole idea: a dot
// between two lowercase words reads the way developers already name things, so
// it says "software" without an icon, a metaphor, or a borrowed grid.
const logo = (cls = "") => `<span class="logo ${cls}">prits<i>.</i>apps</span>`;

// ScripBook's own month, shown inside ScripBook's own section. This is the one
// place cells belong here, and they are a screenshot of the product.
const spend = {3:["#8B5A83"],5:["#5C7A52","#B54834"],9:["#3D6B87"],11:["#5C7A52"],
  16:["#B54834","#7A6A53"],18:["#5C7A52"],22:["#3D6B87","#8B5A83"],24:["#B54834"],27:["#5C7A52"]};
let month = "";
for (let d = 1; d <= 28; d++) {
  const bars = (spend[d] || []).map((c) => `<u style="background:${c}"></u>`).join("");
  month += `<div class="d" style="--i:${d}"><s>${d}</s><div class="bars">${bars}</div></div>`;
}

const HIT = ["NY","NJ","PA","CT","MA","FL","CA","NV","AZ","VT","NH","ME"];
const TODO = ["TX","WA","OR","CO","UT","MT","IL","MI","OH","GA","NC","HI"];
const chips = (list, cls) => list.map((s, i) =>
  `<span class="st ${cls}" style="--i:${i}">${s}</span>`).join("");

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prits Apps</title>
<meta name="description" content="Small apps made by one person. A budgeting app that keeps everything on your phone, and a travel tracker anyone can add to.">
<meta name="theme-color" content="${P.ink.bg}">
<link rel="canonical" href="${SITE}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Prits Apps">
<meta property="og:url" content="${SITE}">
<meta property="og:title" content="Prits Apps">
<meta property="og:description" content="Small apps made by one person. Each one collects only what it needs to work.">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="2400">
<meta property="og:image:height" content="1260">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Prits Apps">
<meta name="twitter:description" content="Small apps made by one person. Each one collects only what it needs to work.">
<meta name="twitter:image" content="${SITE}og.png">

<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:${P.ink.bg};--surf:${P.ink.surf};--accent:${P.ink.accent};--ink:${P.ink.ink};--muted:${muted(P.ink.ink)}}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);overflow-x:hidden;
font:17px/1.62 "Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
-webkit-font-smoothing:antialiased;
transition:background 1s cubic-bezier(.4,0,.2,1),color .8s}
a{color:inherit}

/* The mark: a grotesk wordmark whose separator is the accent. No icon. */
.logo{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;letter-spacing:-.035em}
.logo i{font-style:normal;color:var(--accent);transition:color .8s}

.prog{position:fixed;top:0;left:0;height:2px;width:0;background:var(--accent);z-index:60;
transition:width .12s linear,background .8s}
nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;
padding:17px 30px;backdrop-filter:blur(14px);
background:color-mix(in srgb,var(--bg) 70%,transparent);transition:background 1s}
nav .logo{font-size:17px}
nav .sp{flex:1}
nav a{text-decoration:none;font:500 12px "IBM Plex Mono",monospace;letter-spacing:.08em;
text-transform:uppercase;opacity:.6}

.sec{min-height:100vh;display:flex;align-items:center;padding:112px 30px}
.inner{width:100%;max-width:1060px;margin:0 auto}
.kicker{font:500 11.5px "IBM Plex Mono",monospace;letter-spacing:.18em;text-transform:uppercase;
color:var(--accent);margin-bottom:18px;transition:color .8s}
h1{font-family:"Space Grotesk",sans-serif;font-size:clamp(38px,7vw,82px);line-height:1.02;
letter-spacing:-.045em;font-weight:700}
h1 em{font-style:normal;color:var(--accent);transition:color .8s}
h2{font-family:"Space Grotesk",sans-serif;font-size:clamp(29px,5.2vw,54px);line-height:1.04;
letter-spacing:-.035em;font-weight:700;max-width:18ch}
.lede{font-size:clamp(16.5px,1.9vw,20px);color:var(--muted);max-width:640px;margin-top:20px}

.reveal{opacity:0;transform:translateY(28px);
transition:opacity .85s cubic-bezier(.16,1,.3,1),transform .85s cubic-bezier(.16,1,.3,1)}
.reveal.in{opacity:1;transform:none}
.d1{transition-delay:.11s}.d2{transition-delay:.22s}.d3{transition-delay:.33s}

.hero{position:relative;overflow:hidden}
.wm{position:absolute;right:6vw;bottom:13vh;width:min(38vw,440px);pointer-events:none;
animation:drift 22s ease-in-out infinite alternate}
@media (max-width:1000px){.wm{display:none}}
.wm svg{width:100%;height:auto;display:block}
@keyframes drift{from{transform:translateY(0)}to{transform:translateY(-22px)}}
.hero .inner{position:relative;z-index:1}
.hero .kicker{display:flex;align-items:center;gap:11px}
.hero .kicker b{flex:none;width:26px;height:1px;background:var(--accent);opacity:.7}
.cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}
.btn{background:var(--accent);color:var(--bg);font:600 15.5px "Inter",sans-serif;
padding:14px 28px;border-radius:9px;text-decoration:none;
transition:transform .25s,background .8s,color .8s}
.btn:hover{transform:translateY(-2px)}
.btn.ghost{background:transparent;color:var(--ink);
border:1px solid color-mix(in srgb,var(--ink) 22%,transparent)}

.split{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:58px;align-items:center}
@media (max-width:900px){.split{grid-template-columns:minmax(0,1fr);gap:34px}}

/* ScripBook's month. Cells live here and nowhere else on this site. */
.month{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;background:#2A2418;
padding:17px;border-radius:16px;width:100%;max-width:400px;
box-shadow:0 22px 50px rgba(0,0,0,.45)}
.d{background:rgba(246,243,236,.075);border-radius:6px;aspect-ratio:.86;
padding:6px;display:flex;flex-direction:column;opacity:0;transform:scale(.88);
transition:opacity .5s,transform .5s;transition-delay:calc(var(--i)*19ms)}
.in .d{opacity:1;transform:none}
.d s{text-decoration:none;font:400 10px "IBM Plex Mono",monospace;color:rgba(246,243,236,.55)}
.bars{margin-top:auto;display:flex;gap:1.5px;border-radius:2px;overflow:hidden}
.bars u{height:5px;flex:1}

.map{display:flex;flex-wrap:wrap;gap:7px;width:100%;max-width:400px}
.st{font:500 12.5px "IBM Plex Mono",monospace;letter-spacing:.05em;padding:9px 10px;
border-radius:6px;opacity:0;transform:translateY(8px);
transition:opacity .45s,transform .45s;transition-delay:calc(var(--i)*33ms)}
.in .st{opacity:1;transform:none}
.st.hit{background:#2F4C3B;color:#F1EFEA}
.st.todo{background:color-mix(in srgb,var(--ink) 8%,transparent);color:var(--muted)}

ul.plain{list-style:none;margin-top:36px;display:grid;gap:14px;max-width:680px}
ul.plain li{display:flex;gap:14px;font-size:16px;color:var(--muted)}
ul.plain b{color:var(--ink);font-weight:600}
.tick{font:500 12px "IBM Plex Mono",monospace;color:var(--accent);flex:none;width:18px;
padding-top:3px;transition:color .8s}

footer{padding:66px 30px 88px;text-align:center;color:var(--muted);
font:400 13.5px "IBM Plex Mono",monospace}
footer a{color:var(--accent);text-decoration:none}
footer .sp{margin:0 9px;opacity:.35}
@media (prefers-reduced-motion:reduce){
  *{transition-duration:.01ms !important;animation-duration:.01ms !important}
  .reveal,.d,.st{opacity:1;transform:none}
}
</style></head>
<body>

<div class="prog" id="prog"></div>
<nav>${logo()}<span class="sp"></span><a href="#apps">Apps</a></nav>

<section class="sec hero" ${attrs("ink")}>
  <div class="wm">${markSvg(440, { bg: null, span: 1, ink: "rgba(233,235,240,.075)", accent: ACCENT + "8C" })}</div>
  <div class="inner">
    <div class="reveal in"><div class="kicker"><b></b>Independent software</div></div>
    <div class="reveal in d1"><h1>I build the apps<br>I <em>wanted to use</em>.</h1></div>
    <div class="reveal in d2"><p class="lede">One person, no investors, no growth team. Each app
    collects only what it needs to do its job, and the budgeting one collects nothing at all.</p>
    <div class="cta"><a class="btn" href="#apps">See what's here</a>
    <a class="btn ghost" href="#how">How I build</a></div></div>
  </div>
</section>

<section class="sec" id="apps" ${attrs("slate")}>
  <div class="inner">
    <div class="split">
      <div>
        <div class="reveal"><div class="kicker">iOS and Android · coming soon</div>
        <h2>ScripBook</h2></div>
        <div class="reveal d1"><p class="lede">Your money, on a calendar. Most budget apps hand you
        a list and hope you enjoy scrolling. ScripBook puts what you spent on the day you spent it,
        so a whole month makes sense at a glance. Nothing leaves your phone: no accounts, no
        servers, no tracking.</p>
        <div class="cta"><a class="btn" href="/scripbook/">Read about ScripBook</a></div></div>
      </div>
      <div class="month reveal d2">${month}</div>
    </div>
  </div>
</section>

<section class="sec" ${attrs("bone")}>
  <div class="inner">
    <div class="split">
      <div>
        <div class="reveal"><div class="kicker">Live on the web</div>
        <h2>Hit 50 Before 30</h2></div>
        <div class="reveal d1"><p class="lede">Fifty states, one deadline. A travel tracker anyone
        with the link can browse: see where I've been and where's left, volunteer to come along for
        a trip, or leave a recommendation for somewhere I haven't reached yet. No account needed to
        join in.</p>
        <div class="cta"><a class="btn" href="https://hit-50-before-30.vercel.app">Open the tracker</a></div></div>
      </div>
      <div class="map reveal d2">${chips(HIT, "hit")}${chips(TODO, "todo")}</div>
    </div>
  </div>
</section>

<section class="sec" id="how" ${attrs("coal")}>
  <div class="inner">
    <div class="reveal"><div class="kicker">How I build</div>
    <h2>Only what the app actually needs</h2></div>
    <div class="reveal d1"><p class="lede">These two apps work in opposite ways. One keeps
    everything on your device and never speaks to a server. The other is a public page built to be
    shared. What they have in common is that neither one takes anything it doesn't need to work.</p>
    <ul class="plain">
      <li><span class="tick">01</span><span><b>No ads.</b> Not now, not later, not as a
      subscription you can pay to remove</span></li>
      <li><span class="tick">02</span><span><b>No analytics or tracking SDKs.</b> I don't measure
      how you use these, because I don't need to</span></li>
      <li><span class="tick">03</span><span><b>Nothing sold to anyone.</b> There's no data business
      here, which is what makes the rest of this easy to promise</span></li>
      <li><span class="tick">04</span><span><b>No dark patterns.</b> No streaks that punish you, no
      nagging notifications, no cancellation maze</span></li>
      <li><span class="tick">05</span><span><b>Free where I can make it free.</b> ScripBook is free
      with no paywalled features. There's a tip jar if you'd like to</span></li>
    </ul></div>
  </div>
</section>

<footer>
  Prits Apps LLC<span class="sp">·</span>
  <a href="/scripbook/">ScripBook</a><span class="sp">·</span>
  <a href="https://hit-50-before-30.vercel.app">Hit 50 Before 30</a><span class="sp">·</span>
  <a href="/privacy/">Privacy</a><span class="sp">·</span>
  <a href="https://ko-fi.com/pritsapps">Tip jar</a>
</footer>

<script>
(function(){
  var root = document.documentElement, secs = document.querySelectorAll('.sec');

  var paint = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting && e.intersectionRatio > 0.4){
        var d = e.target.dataset;
        root.style.setProperty('--bg', d.bg);
        root.style.setProperty('--surf', d.surf);
        root.style.setProperty('--accent', d.accent);
        root.style.setProperty('--ink', d.ink);
        root.style.setProperty('--muted', d.muted);
      }
    });
  }, { threshold:[0.4,0.6] });
  secs.forEach(function(s){ paint.observe(s); });

  var show = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); show.unobserve(e.target); }
    });
  }, { threshold:0.18, rootMargin:'0px 0px -8% 0px' });
  document.querySelectorAll('.reveal,.month,.map,.sec').forEach(function(el){ show.observe(el); });

  var prog = document.getElementById('prog');
  window.addEventListener('scroll', function(){
    var max = document.body.scrollHeight - window.innerHeight;
    prog.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }, { passive:true });
})();
</script>
</body></html>`;

fs.writeFileSync(new URL(OUT, import.meta.url), html);
console.log("built " + OUT + ",", html.length, "bytes");
