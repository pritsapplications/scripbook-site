import fs from "node:fs";

const BG="#16150F", PAPER="#241F14", SURF="#332C1E", GOLD="#E8C547",
      DIM="#6E6244", ACCENT="#FF7A45", INK="#F2EFE6", MUTED="#A79E86", GREEN="#6FBF8B";

// Same geometry as the app icon so the site and the product match exactly.
const S_CELLS=[[0,0],[0,1],[0,2],[1,0],[2,0],[2,1],[2,2],[3,2],[4,0],[4,1],[4,2]];
const ACC=[2,1], SHIFT=1;
const isS=(r,c)=>S_CELLS.some(([a,b])=>a===r&&b===c-SHIFT);
const isAcc=(r,c)=>ACC[0]===r&&ACC[1]===c-SHIFT;
function mark(px){
  const S=100,COLS=5,ROWS=5,GR=0.30,SC=0.72;
  const cw=(S*SC)/(COLS+(COLS-1)*GR), gap=cw*GR;
  const tot=COLS*cw+(COLS-1)*gap, o=(S-tot)/2, r=cw*0.24;
  let g="",l="";
  for(let R=0;R<ROWS;R++)for(let C=0;C<COLS;C++){
    const x=(o+C*(cw+gap)).toFixed(2), y=(o+R*(cw+gap)).toFixed(2);
    const t=`<rect x="${x}" y="${y}" width="${cw.toFixed(2)}" height="${cw.toFixed(2)}" rx="${r.toFixed(2)}"`;
    if(isS(R,C)) l+=`${t} fill="${isAcc(R,C)?ACCENT:GOLD}"/>`;
    else g+=`${t} fill="${DIM}" opacity="0.18"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="${px}" height="${px}" class="mark"><rect width="100" height="100" fill="${BG}"/>${g}${l}</svg>`;
}

// A little month, so the idea is visible before it is explained.
function miniMonth(){
  const spend={3:["#8B5A83"],5:["#5C7A52","#B54834"],9:["#3D6B87"],11:["#5C7A52"],
               16:["#B54834","#7A6A53"],18:["#5C7A52"],22:["#3D6B87","#8B5A83"],24:["#B54834"]};
  const none=[7,14,25];
  let cells="";
  for(let d=1;d<=28;d++){
    const bars=(spend[d]||[]).map(c=>`<i style="background:${c}"></i>`).join("");
    const tick=none.includes(d)?`<b class="tick">✓</b>`:"";
    cells+=`<div class="d"><span>${d}</span><div class="bars">${bars}</div>${tick}</div>`;
  }
  return `<div class="month">${cells}</div>`;
}

// A run of days shading from quiet to heavy, showing the heat scale at a glance.
function heatStrip(){
  const pcts=[0.05,0.18,0.3,0.42,0.55,0.68,0.8,0.95];
  const cells=pcts.map((p,i)=>{
    const hue=130-130*p;
    return `<div class="hd" style="--h:hsl(${hue},55%,70%)"><span>${i+1}</span><i></i></div>`;
  }).join("");
  return `<div class="heat">${cells}</div>
  <div class="heat-key"><span>lighter day</span><span>heavier day</span></div>`;
}

const html=`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ScripBook: your money, on a calendar</title>
<meta name="description" content="A budgeting app that puts your spending on a calendar. Nothing leaves your phone. Free, no catch.">
<style>
:root{--bg:${BG};--paper:${PAPER};--surf:${SURF};--gold:${GOLD};--accent:${ACCENT};
--ink:${INK};--muted:${MUTED};--green:${GREEN};--dim:${DIM}}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);
font:17px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
-webkit-font-smoothing:antialiased}
.wrap{max-width:940px;margin:0 auto;padding:0 24px}
nav{display:flex;align-items:center;gap:12px;padding:26px 0}
nav .name{font-weight:700;font-size:19px;letter-spacing:-.01em}
.mark{border-radius:22%;display:block;flex:none}

.hero{padding:64px 0 76px;text-align:center}
.hero h1{font-size:clamp(38px,7vw,62px);line-height:1.05;letter-spacing:-.03em;font-weight:800;margin-bottom:20px}
.hero h1 em{font-style:normal;color:var(--gold)}
.hero p{font-size:clamp(17px,2.4vw,21px);color:var(--muted);max-width:600px;margin:0 auto 30px}
.cta{display:inline-flex;gap:12px;flex-wrap:wrap;justify-content:center}
.btn{display:inline-block;background:var(--gold);color:${BG};font-weight:700;font-size:16px;
padding:14px 26px;border-radius:12px;text-decoration:none}
.btn.ghost{background:transparent;color:var(--ink);border:1px solid #3a3426}
.free{margin-top:16px;font-size:14px;color:var(--muted)}

.month{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;background:var(--paper);
padding:16px;border-radius:18px;max-width:520px;margin:44px auto 0}
.d{background:var(--surf);border-radius:8px;aspect-ratio:.84;padding:6px;position:relative;
display:flex;flex-direction:column}
.d span{font-size:11px;color:var(--ink);opacity:.75}
.bars{margin-top:auto;display:flex;gap:1px;border-radius:2px;overflow:hidden}
.bars i{height:4px;flex:1;display:block}
.tick{position:absolute;bottom:5px;left:6px;color:var(--green);font-size:11px;font-weight:700}
.heat{display:grid;grid-template-columns:repeat(8,1fr);gap:8px;background:var(--paper);
padding:16px;border-radius:16px;margin:34px 0 10px;max-width:560px}
.hd{background:var(--surf);border-radius:8px;aspect-ratio:.8;padding:6px;display:flex;
flex-direction:column;justify-content:space-between;overflow:hidden}
.hd span{font-size:11px;opacity:.7}
.hd i{display:block;height:4px;border-radius:2px;background:var(--h)}
.heat-key{display:flex;justify-content:space-between;max-width:560px;font-size:12px;color:var(--muted)}

section{padding:76px 0;border-top:1px solid #262115}
.kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:12px}
h2{font-size:clamp(26px,4vw,38px);line-height:1.15;letter-spacing:-.02em;font-weight:800;margin-bottom:16px}
.lede{font-size:18px;color:var(--muted);max-width:620px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px;margin-top:38px}
.card{background:var(--paper);border-radius:16px;padding:24px}
.card h3{font-size:17px;margin-bottom:8px}
.card p{font-size:15px;color:var(--muted)}
.big{font-size:clamp(22px,3.4vw,30px);line-height:1.35;font-weight:700;max-width:760px}
.big span{color:var(--gold)}
ul.plain{list-style:none;margin-top:26px;display:grid;gap:14px;max-width:660px}
ul.plain li{display:flex;gap:12px;font-size:16px;color:var(--muted)}
ul.plain b{color:var(--ink);font-weight:600}
.no{color:var(--accent);font-weight:700;flex:none;width:18px}
.yes{color:var(--green);font-weight:700;flex:none;width:18px}
footer{padding:60px 0 80px;border-top:1px solid #262115;color:var(--muted);font-size:14px}
footer a{color:var(--gold)}
.foot-row{display:flex;flex-wrap:wrap;gap:18px;justify-content:space-between;align-items:center}
</style></head>
<body>
<div class="wrap">

<nav>${mark(38)}<span class="name">ScripBook</span></nav>

<div class="hero">
  <h1>Your money,<br>on a <em>calendar</em>.</h1>
  <p>Most budget apps hand you a list and hope you enjoy scrolling. ScripBook puts what you spent
  on the day you spent it, so a whole month makes sense at a glance.</p>
  <div class="cta">
    <a class="btn" href="#">Coming soon</a>
    <a class="btn ghost" href="#how">See how it works</a>
  </div>
  <div class="free">Free. Not free-for-now. Actually free.</div>
  ${miniMonth()}
</div>

<section id="how">
  <div class="kicker">The idea</div>
  <h2>A month you can read in two seconds</h2>
  <p class="lede">You already think about money in weeks and months. Rent lands here, payday lands
  there, the expensive weekend was that one. A list flattens all of that. A calendar doesn't.</p>
  <div class="grid">
    <div class="card"><h3>Spending sits on its day</h3>
      <p>Coloured by category, so a heavy week is obvious without reading a single number.</p></div>
    <div class="card"><h3>Bills turn up on their own</h3>
      <p>Add rent or a subscription once. It appears on every date it's due, forever. Skip one without deleting it.</p></div>
    <div class="card"><h3>Still want a list?</h3>
      <p>It's right there in the next tab. We're not going to be weird about it.</p></div>
  </div>
</section>

<section>
  <div class="kicker">Your data</div>
  <h2>Nothing leaves your phone</h2>
  <p class="big">No accounts. No servers. No analytics. No bank logins.
  <span>We couldn't see your spending if we wanted to.</span> There's nowhere for it to go.</p>
  <ul class="plain">
    <li><span class="no">✕</span><span>No sign-up, because there's <b>no account to sign up for</b></span></li>
    <li><span class="no">✕</span><span>No linking your bank. We never ask for <b>credentials we shouldn't have</b></span></li>
    <li><span class="no">✕</span><span>No trackers, no ads, no "anonymous usage data" that <b>isn't very anonymous</b></span></li>
    <li><span class="yes">✓</span><span>Everything stays in the app, and <b>leaves only when you export it</b></span></li>
  </ul>
</section>

<section>
  <div class="kicker">Spot it instantly</div>
  <h2>Green weeks, red weekends</h2>
  <p class="lede">Every day is tinted by how much went out, green through to red, scaled against
  your own month. You spot the heavy stretch before you have read a single number.</p>
  ${heatStrip()}
  <div class="grid">
    <div class="card"><h3>Relative to you</h3>
      <p>The scale is your own spending, not some average. A quiet month still shows its peaks.</p></div>
    <div class="card"><h3>Patterns you would miss</h3>
      <p>Weekends running hot, the days after payday, the slow creep before rent. Obvious in colour, invisible in a list.</p></div>
    <div class="card"><h3>Off if you prefer</h3>
      <p>One switch in Settings turns the whole thing off. Some people want numbers and nothing else.</p></div>
  </div>
</section>

<section>
  <div class="kicker">How it treats you</div>
  <h2>No guilt, no nagging</h2>
  <p class="lede">Finance apps love telling you off. This one just keeps the records straight and
  lets you draw your own conclusions.</p>
  <div class="grid">
    <div class="card"><h3>A streak that isn't a trap</h3>
      <p>It counts days you kept track, not days you spent less. Logging a big expense keeps it
      alive exactly as well as spending nothing. Miss a day and it survives.</p></div>
    <div class="card"><h3>Days you spent nothing count too</h3>
      <p>Mark them. They show up on the calendar, quietly satisfying, no confetti required.</p></div>
    <div class="card"><h3>Hide the numbers</h3>
      <p>One tap blanks your totals when someone's looking over your shoulder in public.</p></div>
  </div>
</section>

<section>
  <div class="kicker">Make it yours</div>
  <h2>A finance app you don't dread opening</h2>
  <p class="lede">Fourteen palettes, six fonts, three shapes. Pick your look before you enter a
  single expense. Every combination is contrast-checked, so it stays readable no matter what you choose.</p>
</section>

<section>
  <div class="kicker">Why it exists</div>
  <h2>I built the app I wanted to use</h2>
  <p class="lede">Every budget app I tried wanted my bank logins and my spending history before it
  would show me anything. That felt like a lot to hand over just to find out where my money went.</p>
  <p class="lede" style="margin-top:18px">So this one keeps everything on your phone. Not as a
  feature to put on a list, but because I did not want my own data sitting on somebody else's
  server either. You get to be exactly as private with it as I am.</p>
  <p class="lede" style="margin-top:18px">The calendar came from the same place. I am a visual
  learner. A column of numbers tells me nothing, but a month with colour on it tells me everything.
  If you think the same way, this was built for you too.</p>
</section>

<section>
  <div class="kicker">The price</div>
  <h2>Free. Here's the catch: there isn't one.</h2>
  <p class="lede">No trial, no paywalled "pro" features, no subscription appearing in six months.
  There's no server to pay for and no data to sell, which makes free surprisingly easy.
  If you like it, there's a tip jar. That's the whole business model.</p>
  <div class="cta" style="margin-top:28px">
    <a class="btn" href="#">Coming soon</a>
    <a class="btn ghost" href="https://ko-fi.com/pritsapps">Tip jar</a>
  </div>
</section>

<footer>
  <div class="foot-row">
    <div>ScripBook. A budgeting app that stays on your phone.</div>
    <div><a href="https://pritsapplications.github.io/scripbook-privacy/">Privacy</a></div>
  </div>
</footer>

</div></body></html>`;

fs.writeFileSync(new URL("index.html", import.meta.url), html);
console.log("built", html.length, "bytes");
