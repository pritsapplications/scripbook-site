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
import { HEAT, CAT, MIX, ramp } from "./month.mjs";

const SITE = "https://pritsapps.com/";
const ACCENT = process.env.ACCENT || "#C2D6DE";   // the one color the studio owns
const OUT = process.env.OUT || "index.html";

// A tonal run through neutrals rather than a tour of other people's palettes.
// Each app's own colour appears only as an accent, never as the ground.
const P = {
  ink:   { bg:"#0E1014", surf:"#181B21", accent:ACCENT,   ink:"#E9EBF0" },
  slate: { bg:"#13161B", surf:"#1D2128", accent:"#E8C547", ink:"#E9EBF0" },  // ScripBook
  steel: { bg:"#111316", surf:"#1B1E23", accent:"#D0703F", ink:"#E9EBF0" },  // Decide Already
  tide:  { bg:"#101317", surf:"#1A1E22", accent:"#D9622B", ink:"#E9EBF0" },  // You In?, its own orange
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

// Decide Already's own wheel, a preview card rather than a lone icon, same
// idea as ScripBook's month below. The card and wheel colors are lifted
// straight from the app's own light theme (src/theme.js), not invented for
// the site, so it reads as the actual tool rather than a logo standing in
// for it.
const wheel = `<div class="wheelcard">
  <div class="wheel-dial"><div class="wheel-pointer"></div><div class="wheel-ball"></div></div>
  <div class="wheel-row"><span class="pill">Penny</span><span class="pill">Dice</span>
  <span class="pill active">Wheel</span><span class="pill">Straws</span></div>
</div>`;

// You In?'s own mark, two footprints walking together, sized down to sit in
// a header rather than stand alone. Orange and teal are the app's real
// colors, hardcoded the same way the wheel's copper is above.
const footprintsIcon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
  <g fill="#D9622B"><ellipse cx="24" cy="38" rx="6" ry="9" transform="rotate(-10 24 38)"/>
  <circle cx="20" cy="27" r="2"/><circle cx="24" cy="25" r="2"/><circle cx="28" cy="26" r="2"/></g>
  <g fill="#1F7A8C"><ellipse cx="40" cy="28" rx="6" ry="9" transform="rotate(10 40 28)"/>
  <circle cx="36" cy="40" r="2"/><circle cx="40" cy="42" r="2"/><circle cx="44" cy="41" r="2"/></g>
</svg>`;

// You In?'s own board, a preview card in the app's actual paper and ink,
// the same approach as the wheel above: real colors, not a logo.
const board = `<div class="board">
  <div class="board-top">${footprintsIcon(22)}<b>Pacific Loop</b></div>
  <div class="board-row"><span class="chk">&#10003;</span>Olympic National Park</div>
  <div class="board-row"><span class="chk">&#10003;</span>Mount Rainier</div>
  <div class="board-row"><span class="vol">+2</span>North Cascades</div>
  <div class="board-row"><span class="vol">+1</span>San Juan Islands</div>
  <div class="board-link">you-in-app.vercel.app/b/pacific-loop</div>
</div>`;
const logo = (cls = "") => `<span class="logo ${cls}">prits<i>.</i>apps</span>`;

// ScripBook's own month, shown inside ScripBook's own section. This is the one
// place cells belong here, and they are a screenshot of the product.
//
// The days are colored by the heat map, which is the feature that makes the
// calendar worth having: it's what lets a month be read rather than added up.
// It used to show category-colored bars instead, which is real but says
// nothing about how the app is meant to be used.
//
// Shown filled rather than as the four-pixel bar the app defaults to. At this
// size the bar is too small to register as a system, and a preview that can't
// be read isn't selling anything. Filling the day is one of the app's own
// modes, not an invention for the website.
//

// Every step of the classic ramp is light enough that the app picks its dark
// ink for the number, so there is no per-day contrast decision to make here.
//
// Heat and categories answer different questions and the app shows both at
// once: the fill is how much went out that day, the bar is what it went on.
// The category colors are all dark and muted, so they hold up against every
// step of the ramp.
let month = "";
for (let d = 1; d <= 28; d++) {
  const p = HEAT[d];
  const mix = MIX[d] || [];
  const bar = mix.length
    ? `<u>${mix.map(([id, w]) =>
        `<b style="flex:${w};background:${CAT[id]}"></b>`).join("")}</u>`
    : "";
  month += p > 0
    ? `<div class="d hot" style="--i:${d};background:${ramp(p)}"><s>${d}</s>${bar}</div>`
    : `<div class="d" style="--i:${d}"><s>${d}</s></div>`;
}

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prits Apps</title>
<meta name="description" content="Small apps made by one person. A budgeting app that keeps everything on your phone, and a shared board anyone can plan a trip on.">
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

<link rel="icon" href="/favicon.ico?v=2" sizes="32x32">
<link rel="icon" href="/icon.svg?v=2" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">
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
.d.hot s{color:#16150F;font-weight:500}
/* Full width, split by each category's share of the day, same as the app. */
.d u{margin-top:auto;display:flex;height:4px;border-radius:2px;overflow:hidden}
.d u b{display:block}
/* Spelling out what the colors mean, so the month reads as a scale rather
   than as decoration. */
.leg{display:flex;align-items:center;gap:10px;margin-top:14px;max-width:400px;
font:400 10.5px "IBM Plex Mono",monospace;letter-spacing:.11em;text-transform:uppercase;
color:var(--muted);transition:color .8s}
.leg i{flex:1;height:5px;border-radius:3px;
background:linear-gradient(90deg,hsl(130 48% 72%),hsl(65 64% 64%),hsl(0 80% 56%))}

ul.plain{list-style:none;margin-top:36px;display:grid;gap:14px;max-width:680px}
ul.plain li{display:flex;gap:14px;font-size:16px;color:var(--muted)}
ul.plain b{color:var(--ink);font-weight:600}
.tick{font:500 12px "IBM Plex Mono",monospace;color:var(--accent);flex:none;width:18px;
padding-top:3px;transition:color .8s}

/* Decide Already's wheel, lifted from its own light theme: #F5F3EF ground,
   #B0502A copper, #17171A ink. A card rather than a lone icon, same move as
   ScripBook's month and You In?'s board below. */
.wheelcard{background:#F5F3EF;border:1px solid #DDD8CF;border-radius:16px;padding:26px 24px;
width:100%;max-width:400px;box-shadow:0 22px 50px rgba(0,0,0,.45);
display:flex;flex-direction:column;align-items:center;gap:18px}
.wheel-dial{width:150px;height:150px;border-radius:50%;position:relative;
box-shadow:inset 0 0 0 1px #DDD8CF;
background:conic-gradient(#E6E1D8 0deg 60deg,#D6CFC3 60deg 120deg,#C7BEB0 120deg 180deg,
#B0502A 180deg 240deg,#D6CFC3 240deg 300deg,#E6E1D8 300deg 360deg)}
.wheel-ball{position:absolute;top:50%;left:50%;width:22px;height:22px;border-radius:50%;
background:#17171A;transform:translate(-50%,-50%);box-shadow:0 2px 6px rgba(0,0,0,.35)}
.wheel-pointer{position:absolute;top:-8px;left:50%;width:0;height:0;transform:translateX(-50%);
border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:14px solid #17171A}
.wheel-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.pill{font:500 11.5px "IBM Plex Mono",monospace;letter-spacing:.04em;padding:7px 11px;
border-radius:7px;background:#ECE8E1;color:#6B6760}
.pill.active{background:#B0502A;color:#F5F3EF}

/* You In?'s board, in its own paper and ink: #FBF3E7, #2B1D14, orange for a
   done place, teal for a volunteer. The same real-colors-not-a-logo move. */
.board{background:#FBF3E7;border:1px solid #E6D5BC;border-radius:16px;padding:22px 24px;
width:100%;max-width:400px;box-shadow:0 22px 50px rgba(0,0,0,.45);font-family:"Inter",sans-serif}
.board-top{display:flex;align-items:center;gap:10px;margin-bottom:14px;
font:600 15px "Space Grotesk",sans-serif;color:#2B1D14}
.board-row{display:flex;align-items:center;gap:10px;padding:9px 0;font-size:14.5px;
color:#2B1D14;border-top:1px solid #E6D5BC}
.board-row:first-of-type{border-top:none}
.chk{width:20px;height:20px;border-radius:50%;background:#D9622B;color:#FBF3E7;
font:700 11px/20px "Inter",sans-serif;text-align:center;flex:none}
.vol{min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#1F7A8C;color:#FBF3E7;
font:700 11px/20px "IBM Plex Mono",monospace;text-align:center;flex:none}
.board-link{margin-top:14px;padding-top:12px;border-top:1px dashed #E6D5BC;
font:500 11.5px "IBM Plex Mono",monospace;letter-spacing:.03em;color:#6B5A48}

footer{padding:66px 30px 88px;text-align:center;color:var(--muted);
font:400 13.5px "IBM Plex Mono",monospace}
footer a{color:var(--accent);text-decoration:none}
footer .sp{margin:0 9px;opacity:.35}
@media (prefers-reduced-motion:reduce){
  *{transition-duration:.01ms !important;animation-duration:.01ms !important}
  .reveal,.d{opacity:1;transform:none}
}
</style></head>
<body>

<div class="prog" id="prog"></div>
<nav>${logo()}<span class="sp"></span><a href="#apps">Apps</a></nav>

<section class="sec hero" ${attrs("ink")}>
  <div class="wm">${markSvg(440, { bg: null, span: 1, ink: "rgba(233,235,240,.075)", accent: ACCENT + "8C" })}</div>
  <div class="inner">
    <div class="reveal in"><div class="kicker"><b></b>Independent software</div></div>
    <div class="reveal in d1"><h1>I build the apps<br>I <em>wish I had</em>.</h1></div>
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
        a list and hope you enjoy scrolling. ScripBook puts what you spent on the day you spent it
        and colors each day by how heavy it was, so the expensive week shows up before you've read a
        single number. Nothing leaves your phone: no accounts, no servers, no tracking.</p>
        <div class="cta"><a class="btn" href="/scripbook/">Read about ScripBook</a></div></div>
      </div>
      <div class="reveal d2"><div class="month">${month}</div>
      <div class="leg"><span>Quiet</span><i></i><span>Heavy</span></div></div>
    </div>
  </div>
</section>

<section class="sec" ${attrs("steel")}>
  <div class="inner">
    <div class="split">
      <div>
        <div class="reveal"><div class="kicker">Live on the web · iOS and Android coming soon</div>
        <h2>Decide Already</h2></div>
        <div class="reveal d1"><p class="lede">Can't pick? Flip a penny, roll any dice, spin your own
        wheel, draw straws, or let everyone put a finger down. Eleven quick ways to settle it, every
        one of them fair. It runs right here in your browser, and nothing you do leaves your device.</p>
        <div class="cta"><a class="btn" href="/decide-already/">Open Decide Already</a></div></div>
      </div>
      <div class="reveal d2">${wheel}</div>
    </div>
  </div>
</section>

<section class="sec" ${attrs("tide")}>
  <div class="inner">
    <div class="split">
      <div>
        <div class="reveal"><div class="kicker">Live on the web</div>
        <h2>You In?</h2></div>
        <div class="reveal d1"><p class="lede">A shared board for a trip, built for more than one
        person. List where you want to go and share the link, and anyone who opens it can comment
        or quietly volunteer to come along, no account needed on their end. Only the board's owner
        sees who volunteered, and anyone can start their own board for any trip.</p>
        <div class="cta"><a class="btn" href="https://you-in-app.vercel.app">Open You In?</a></div></div>
      </div>
      <div class="reveal d2">${board}</div>
    </div>
  </div>
</section>

<section class="sec" id="how" ${attrs("coal")}>
  <div class="inner">
    <div class="reveal"><div class="kicker">How I build</div>
    <h2>Only what the app actually needs</h2></div>
    <div class="reveal d1"><p class="lede">These apps work in different ways. ScripBook and Decide
    Already keep everything on your device and never speak to a server. You In? is a shared, public
    board, so it needs an account for whoever's running it and nothing more than a link for anyone
    else. What they have in common is that none of them takes anything it doesn't need to work.</p>
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
  <a href="/decide-already/">Decide Already</a><span class="sp">·</span>
  <a href="https://you-in-app.vercel.app">You In?</a><span class="sp">·</span>
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
  document.querySelectorAll('.reveal,.month,.sec').forEach(function(el){ show.observe(el); });

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
