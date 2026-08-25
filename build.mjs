import fs from "node:fs";

// Every section carries one of the app's real palettes, and the page shifts
// into it as you arrive. The site demonstrates the customisation feature
// rather than describing it.
const P = {
  gold:   { bg:"#241F14", surf:"#332C1E", accent:"#E8C547" },
  ink:    { bg:"#101823", surf:"#1C2735", accent:"#5B9BD5" },
  red:    { bg:"#1F1416", surf:"#2E1F21", accent:"#E05252" },
  black:  { bg:"#121212", surf:"#1E1E1E", accent:"#6FBF8B" },
  green:  { bg:"#131F19", surf:"#1F2E25", accent:"#6FBF8B" },
  purple: { bg:"#1B1729", surf:"#272038", accent:"#A78BE8" },
  brown:  { bg:"#1E1A17", surf:"#2C2724", accent:"#C9A24B" },
};

const S_CELLS=[[0,0],[0,1],[0,2],[1,0],[2,0],[2,1],[2,2],[3,2],[4,0],[4,1],[4,2]];
const isS=(r,c)=>S_CELLS.some(([a,b])=>a===r&&b===c-1);
const isAcc=(r,c)=>r===2&&c===2;
function mark(px){
  const S=100,GR=.30,SC=.72,cw=(S*SC)/(5+4*GR),gap=cw*GR;
  const tot=5*cw+4*gap,o=(S-tot)/2,r=cw*.24;
  let g="",l="";
  for(let R=0;R<5;R++)for(let C=0;C<5;C++){
    const x=(o+C*(cw+gap)).toFixed(2),y=(o+R*(cw+gap)).toFixed(2);
    const t=`<rect x="${x}" y="${y}" width="${cw.toFixed(2)}" height="${cw.toFixed(2)}" rx="${r.toFixed(2)}"`;
    if(isS(R,C)) l+=`${t} fill="${isAcc(R,C)?"#FF7A45":"currentColor"}"/>`;
    else g+=`${t} fill="currentColor" opacity=".18"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="${px}" height="${px}" class="mark">${g}${l}</svg>`;
}

// A month that draws itself in as you reach it.
function calendar(){
  const spend={3:["#8B5A83"],5:["#5C7A52","#B54834"],9:["#3D6B87"],11:["#5C7A52"],
    16:["#B54834","#7A6A53"],18:["#5C7A52"],22:["#3D6B87","#8B5A83"],24:["#B54834"],27:["#5C7A52"]};
  const none=[7,14,25];
  let c="";
  for(let d=1;d<=28;d++){
    const bars=(spend[d]||[]).map(x=>`<i style="background:${x}"></i>`).join("");
    c+=`<div class="day" style="--i:${d}"><span>${d}</span>
      ${none.includes(d)?'<b class="tick">✓</b>':""}<div class="bars">${bars}</div></div>`;
  }
  return `<div class="month">${c}</div>`;
}

// The heat scale, animating from flat to graded.
function heatGrid(){
  const v=[.08,.9,.22,.5,.15,.35,.7,.12,.45,.28,1,.18,.6,.3,.1,.75,.4,.2,.55,.25,.85,.14];
  return `<div class="heat">${v.map((p,i)=>
    `<div class="hc" style="--p:${p};--i:${i}"><i></i></div>`).join("")}</div>`;
}

// Streak digits built from the same cell grid as the app badge.
const DIG={0:["111","101","101","101","111"],1:["010","110","010","010","111"],2:["111","001","111","100","111"],
3:["111","001","111","001","111"],4:["101","101","111","001","001"],5:["111","100","111","001","111"],
6:["111","100","111","101","111"],7:["111","001","001","001","001"],8:["111","101","111","101","111"],9:["111","101","111","001","111"]};
function streakNum(n){
  const ds=String(n).split(""); let rows=[];
  for(let r=0;r<5;r++){let row=[];ds.forEach((d,i)=>{if(i)row.push(0);DIG[d][r].split("").forEach(b=>row.push(+b));});rows.push(row);}
  return `<div class="snum">${rows.map(r=>
    `<div class="srow">${r.map(v=>`<b class="${v?"on":"off"}"></b>`).join("")}</div>`).join("")}</div>`;
}

// A down arrow drawn in the same cell grid as the icon and the streak badge,
// with the lit cells pulsing top to bottom so the eye is pulled downward.
function scrollCue(){
  const on=[[0,2],[1,2],[2,0],[2,2],[2,4],[3,1],[3,2],[3,3],[4,2]];
  let c="";
  for(let r=0;r<5;r++)for(let k=0;k<5;k++){
    const lit=on.some(([a,b])=>a===r&&b===k);
    c+=`<b class="${lit?"on":""}" style="--r:${r}"></b>`;
  }
  return `<div class="cue" id="cue" role="button" tabindex="0" aria-label="Scroll down"><div class="cuegrid">${c}</div></div>`;
}

const sec = (id, pal, kicker, h2, body, extra="") => `
<section class="sec" id="${id}" data-bg="${P[pal].bg}" data-surf="${P[pal].surf}" data-accent="${P[pal].accent}">
  <div class="inner">
    <div class="reveal"><div class="kicker">${kicker}</div><h2>${h2}</h2></div>
    <div class="reveal d1"><p class="lede">${body}</p></div>
    ${extra}
  </div>
</section>`;

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ScripBook: your money, on a calendar</title>
<meta name="description" content="A budgeting app that puts your spending on a calendar. Nothing leaves your phone. Free, no catch.">
<style>
:root{--bg:${P.gold.bg};--surf:${P.gold.surf};--accent:${P.gold.accent};--ink:#F6F3EC;--muted:rgba(246,243,236,.62)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);overflow-x:hidden;
font:17px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
-webkit-font-smoothing:antialiased;transition:background 1s cubic-bezier(.4,0,.2,1),color .8s}
.mark{color:var(--accent);border-radius:22%;transition:color .8s}

nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;gap:11px;
padding:18px 30px;backdrop-filter:blur(14px);background:color-mix(in srgb,var(--bg) 72%,transparent);
transition:background 1s}
nav .nm{font-weight:700;font-size:17px;letter-spacing:-.01em}
nav .sp{flex:1}
nav a{color:var(--ink);text-decoration:none;font-size:14px;opacity:.7}

.sec{min-height:100vh;display:flex;align-items:center;padding:110px 30px;position:relative}
.inner{width:100%;max-width:1080px;margin:0 auto}
.hero{text-align:center;min-height:100vh}
.hero h1{font-size:clamp(44px,9vw,110px);line-height:.98;letter-spacing:-.045em;font-weight:800;margin-bottom:26px}
.hero h1 em{font-style:normal;color:var(--accent);transition:color .8s}
.hero p{font-size:clamp(17px,2.2vw,23px);color:var(--muted);max-width:620px;margin:0 auto 34px}

.kicker{font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);
font-weight:700;margin-bottom:16px;transition:color .8s}
h2{font-size:clamp(32px,6vw,64px);line-height:1.02;letter-spacing:-.035em;font-weight:800;margin-bottom:22px;max-width:15ch}
.lede{font-size:clamp(17px,2vw,21px);color:var(--muted);max-width:620px}

.reveal{opacity:0;transform:translateY(30px);transition:opacity .85s cubic-bezier(.16,1,.3,1),transform .85s cubic-bezier(.16,1,.3,1)}
.reveal.in{opacity:1;transform:none}
.d1{transition-delay:.12s}.d2{transition-delay:.24s}.d3{transition-delay:.36s}

.cta{display:inline-flex;gap:13px;flex-wrap:wrap;justify-content:center}
.btn{background:var(--accent);color:var(--bg);font-weight:700;font-size:16px;padding:16px 32px;
border-radius:14px;text-decoration:none;transition:transform .25s,background .8s,color .8s}
.btn:hover{transform:translateY(-2px)}
.btn.ghost{background:transparent;color:var(--ink);border:1px solid color-mix(in srgb,var(--ink) 22%,transparent)}
.free{margin-top:18px;font-size:14px;color:var(--muted)}

.month{display:grid;grid-template-columns:repeat(7,1fr);gap:9px;background:var(--surf);
padding:20px;border-radius:22px;max-width:600px;margin:46px auto 0;transition:background 1s}
.day{background:color-mix(in srgb,var(--ink) 7%,transparent);border-radius:10px;aspect-ratio:.86;
padding:7px;position:relative;display:flex;flex-direction:column;
opacity:0;transform:scale(.86);transition:opacity .5s,transform .5s;transition-delay:calc(var(--i)*22ms)}
.in .day,.month.in .day{opacity:1;transform:none}
.day span{font-size:11px;opacity:.72}
.bars{margin-top:auto;display:flex;gap:1.5px;border-radius:3px;overflow:hidden}
.bars i{height:5px;flex:1}
.tick{position:absolute;bottom:6px;left:7px;color:#6FBF8B;font-size:11px;font-weight:700}

.heat{display:grid;grid-template-columns:repeat(11,1fr);gap:7px;background:var(--surf);
padding:18px;border-radius:20px;max-width:620px;margin:44px 0 0;transition:background 1s}
.hc{aspect-ratio:1;border-radius:8px;background:color-mix(in srgb,var(--ink) 7%,transparent);
display:flex;align-items:flex-end;padding:5px}
.hc i{display:block;width:100%;height:5px;border-radius:3px;background:hsl(130,48%,72%);
transition:background 1.1s cubic-bezier(.4,0,.2,1);transition-delay:calc(var(--i)*45ms)}
.in .hc i{background:hsl(calc(130 - 130*var(--p)),calc(48% + 32%*var(--p)),calc(72% - 16%*var(--p)))}

.snum{display:inline-flex;flex-direction:column;gap:6px;margin:44px 0 0}
.srow{display:flex;gap:6px}
.snum b{width:20px;height:20px;border-radius:5px;background:var(--ink);opacity:.14;transition:opacity .5s,background .8s}
.snum b.on{background:var(--accent);opacity:0}
.in .snum b.on{opacity:1}
.snum b.on:nth-child(odd){transition-delay:.15s}

.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:44px}
.card{background:var(--surf);border-radius:18px;padding:26px;transition:background 1s,transform .3s}
.card:hover{transform:translateY(-3px)}
.card h3{font-size:17px;margin-bottom:9px}
.card p{font-size:15px;color:var(--muted)}

ul.plain{list-style:none;margin-top:34px;display:grid;gap:16px;max-width:660px}
ul.plain li{display:flex;gap:14px;font-size:16.5px;color:var(--muted)}
ul.plain b{color:var(--ink);font-weight:600}
.no{color:#E05252;font-weight:700;flex:none;width:18px}
.yes{color:#6FBF8B;font-weight:700;flex:none;width:18px}

.swatches{display:flex;flex-wrap:wrap;gap:11px;margin-top:40px;max-width:640px}
.sw{width:52px;height:52px;border-radius:14px;opacity:0;transform:scale(.6);
transition:opacity .5s,transform .5s;transition-delay:calc(var(--i)*45ms)}
.in .sw{opacity:1;transform:none}

.big{font-size:clamp(23px,3.6vw,36px);line-height:1.3;font-weight:700;max-width:820px}
.big span{color:var(--accent);transition:color .8s}

.prog{position:fixed;top:0;left:0;height:2px;width:0;background:var(--accent);z-index:60;transition:width .12s linear,background .8s}
.cue{position:fixed;left:0;right:0;bottom:26px;display:flex;justify-content:center;z-index:40;
opacity:0;animation:cueIn .9s ease 1.2s forwards;transition:opacity .4s}
.cue.gone{opacity:0;pointer-events:none;animation:none}
.cuegrid{display:grid;grid-template-columns:repeat(5,9px);gap:4px;cursor:pointer;animation:bob 2.6s ease-in-out infinite}
.cuegrid b{width:9px;height:9px;border-radius:2.5px;background:var(--accent);opacity:.11;transition:background .8s}
.cuegrid b.on{opacity:.22;animation:pulse 1.7s ease-in-out infinite;animation-delay:calc(var(--r)*.13s)}
@keyframes cueIn{to{opacity:1}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
@keyframes pulse{0%,58%,100%{opacity:.22}26%{opacity:1}}

footer{padding:80px 30px 100px;text-align:center;color:var(--muted);font-size:14px}
footer a{color:var(--accent)}
@media (prefers-reduced-motion:reduce){
  *{transition-duration:.01ms !important;animation-duration:.01ms !important}
  .reveal{opacity:1;transform:none}.day,.sw{opacity:1;transform:none}
  .cue{opacity:1}.cuegrid b.on{opacity:1}
}
</style></head>
<body>

<div class="prog" id="prog"></div>
<nav><span style="color:var(--accent)">${mark(30)}</span><span class="nm">ScripBook</span>
<span class="sp"></span><a href="#why">Why</a></nav>

<section class="sec hero" data-bg="${P.gold.bg}" data-surf="${P.gold.surf}" data-accent="${P.gold.accent}">
  <div class="inner">
    <div class="reveal in"><h1>Your money,<br>on a <em>calendar</em>.</h1></div>
    <div class="reveal in d1"><p>Most budget apps hand you a list and hope you enjoy scrolling.
    ScripBook puts what you spent on the day you spent it, so a whole month makes sense at a glance.</p></div>
    <div class="reveal in d2"><div class="cta">
      <a class="btn" href="#">Coming soon</a><a class="btn ghost" href="#how">See how it works</a>
    </div><div class="free">Free. Not free-for-now. Actually free.</div></div>
    ${calendar()}
  </div>
</section>

${sec("how","ink","The idea","A month you can read in two seconds",
"You already think about money in weeks and months. Rent lands here, payday lands there, the expensive weekend was that one. A list flattens all of that. A calendar doesn't.",
`<div class="grid reveal d2">
  <div class="card"><h3>Spending sits on its day</h3><p>Colored by category, so a heavy week is obvious without reading a single number.</p></div>
  <div class="card"><h3>Bills turn up on their own</h3><p>Add rent or a subscription once. It appears on every date it's due, forever.</p></div>
  <div class="card"><h3>Still want a list?</h3><p>It's right there in the next tab. We're not going to be weird about it.</p></div>
</div>`)}

${sec("heat","red","Spot it instantly","You will see it before you read it",
"Every day is tinted by how much went out, green through to red, scaled against your own month. You'll spot a bad week before you've read a single figure.",
heatGrid())}

${sec("privacy","black","Your data","Nothing leaves your phone",
"No accounts. No servers. No analytics. No bank logins.",
`<div class="reveal d2"><p class="big">We couldn't see your spending if we wanted to.
<span>There's nowhere for it to go.</span></p>
<ul class="plain">
  <li><span class="no">✕</span><span>No sign-up, because there's <b>no account to sign up for</b></span></li>
  <li><span class="no">✕</span><span>No linking your bank. We never ask for <b>credentials we shouldn't have</b></span></li>
  <li><span class="no">✕</span><span>No trackers, no ads, no anonymous usage data that <b>isn't very anonymous</b></span></li>
  <li><span class="yes">✓</span><span>Everything stays in the app and <b>leaves only when you export it</b></span></li>
</ul></div>`)}

${sec("streak","green","How it treats you","A streak that isn't a trap",
"It counts days you kept track, not days you spent less. Logging a big expense keeps it alive exactly as well as spending nothing. Miss a day and it survives.",
`<div class="reveal d2">${streakNum(28)}</div>
<div class="grid reveal d3">
  <div class="card"><h3>Days you spent nothing count too</h3><p>Mark them. They show up on the calendar, quietly satisfying, no confetti required.</p></div>
  <div class="card"><h3>Hide the numbers</h3><p>One tap blanks your totals when someone is looking over your shoulder in public.</p></div>
  <div class="card"><h3>No nagging</h3><p>No notifications begging you to come back. The app waits.</p></div>
</div>`)}

${sec("yours","purple","Make it yours","A finance app you don't dread opening",
"Sixteen palettes, six fonts, three shapes. Pick your look before you enter a single expense. Every combination is contrast-checked, so it stays readable no matter what you choose.",
`<div class="swatches reveal d2">
${["#E8C547","#E8944A","#E05252","#E88BA8","#A78BE8","#5B9BD5","#6FBF8B","#FFF8E1","#121212","#ECECEC","#C9A24B","#D8A94A"]
.map((c,i)=>`<div class="sw" style="background:${c};--i:${i}"></div>`).join("")}
</div>`)}

${sec("why","brown","Why it exists","I built the app I wanted to use",
"Every budget app I tried wanted my bank logins and my spending history before it would show me anything. That felt like a lot to hand over just to find out where my money went.",
`<div class="reveal d2"><p class="lede" style="margin-top:20px">So this one keeps everything on your phone.
Not as a feature to put on a list, but because I didn't want my own data sitting on somebody else's
server. You get to be exactly as private with it as I am.</p>
<p class="lede" style="margin-top:20px">The calendar came from the same place. I'm a visual learner.
A column of numbers tells me nothing, but a month with color on it tells me everything. If you think
the same way, this was built for you too.</p></div>`)}

${sec("price","gold","The price","Free. Here's the catch: there isn't one.",
"No trial, no paywalled pro features, no subscription appearing in six months. There's no server to pay for and no data to sell, which makes free surprisingly easy. If you like it, there's a tip jar. That's the whole business model.",
`<div class="reveal d2" style="margin-top:34px"><div class="cta">
  <a class="btn" href="#">Coming soon</a>
  <a class="btn ghost" href="https://ko-fi.com/pritsapps">Tip jar</a>
</div></div>`)}

${scrollCue()}

<footer>ScripBook. A budgeting app that stays on your phone. &nbsp;·&nbsp;
<a href="https://pritsapplications.github.io/scripbook-privacy/">Privacy</a></footer>

<script>
(function(){
  var root = document.documentElement;
  var secs = document.querySelectorAll('.sec');

  // Repaint the page in whichever section owns the most of the viewport, so the
  // palette shifts as you travel rather than snapping at a hard boundary.
  var paint = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting && e.intersectionRatio > 0.4){
        var d = e.target.dataset;
        root.style.setProperty('--bg', d.bg);
        root.style.setProperty('--surf', d.surf);
        root.style.setProperty('--accent', d.accent);
      }
    });
  }, { threshold:[0.4,0.6] });
  secs.forEach(function(s){ paint.observe(s); });

  // Reveal on arrival. Elements stay revealed once shown: re-hiding them on the
  // way back up reads as a glitch rather than an effect.
  var show = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); show.unobserve(e.target); }
    });
  }, { threshold:0.18, rootMargin:'0px 0px -8% 0px' });
  document.querySelectorAll('.reveal,.month,.heat,.snum,.swatches').forEach(function(el){ show.observe(el); });
  document.querySelectorAll('.sec').forEach(function(el){ show.observe(el); });
  // The cue has done its job the moment they move, so it retires on first scroll.
  var cue = document.getElementById('cue');
  var prog = document.getElementById('prog');
  function onScroll(){
    var y = window.scrollY;
    var max = document.body.scrollHeight - window.innerHeight;
    prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    cue.classList.toggle('gone', y > 60);
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
  function jump(){ document.getElementById('how').scrollIntoView({ behavior:'smooth' }); }
  cue.addEventListener('click', jump);
  cue.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); jump(); }
  });
})();
</script>
</body></html>`;

fs.writeFileSync(new URL("index.html", import.meta.url), html);
console.log("built", html.length, "bytes");
