#!/usr/bin/env bash
# Rasterizes the favicon sizes and packs the .ico. PNG-in-ICO, which every
# browser still in use understands, so there is no bitmap encoder to write.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
node favicon.mjs
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --hide-scrollbars --window-size=512,512 --default-background-color=00000000 \
  --screenshot=src/icon-512.png "file://$PWD/src/favicon.html" 2>/dev/null

cp src/icon-512.png apple-touch-icon.png
sips -z 180 180 apple-touch-icon.png >/dev/null
for s in 48 32 16; do sips -z $s $s src/icon-512.png --out "src/icon-$s.png" >/dev/null; done

node -e '
const fs=require("fs");
// ICO: 6-byte header, then one 16-byte directory entry per image, then the
// PNG payloads. width/height of 0 would mean 256; ours are all smaller.
const sizes=[16,32,48];
const imgs=sizes.map(s=>fs.readFileSync(`src/icon-${s}.png`));
const head=Buffer.alloc(6); head.writeUInt16LE(0,0); head.writeUInt16LE(1,2); head.writeUInt16LE(sizes.length,4);
let off=6+16*sizes.length;
const dir=Buffer.concat(sizes.map((s,i)=>{
  const e=Buffer.alloc(16);
  e[0]=s; e[1]=s; e[2]=0; e[3]=0;
  e.writeUInt16LE(1,4); e.writeUInt16LE(32,6);
  e.writeUInt32LE(imgs[i].length,8); e.writeUInt32LE(off,12);
  off+=imgs[i].length; return e;
}));
fs.writeFileSync("favicon.ico",Buffer.concat([head,dir,...imgs]));
console.log("favicon.ico",fs.statSync("favicon.ico").size,"bytes, sizes",sizes.join("/"));
'
sips -g pixelWidth -g pixelHeight apple-touch-icon.png | grep pixel
