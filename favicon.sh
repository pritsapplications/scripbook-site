#!/usr/bin/env bash
# Rasterizes both favicon sets and packs the .icos. PNG-in-ICO, which every
# browser still in use understands, so there is no bitmap encoder to write.
#
# Two sets, not one. The studio's p.a mark serves the domain root, ScripBook's
# S grid serves scripbook/. They used to share the root, which put ScripBook's
# icon in the tab of every studio page.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# $1 = source html, $2 = output directory ("." for the root)
render() {
  "$CHROME" --headless --disable-gpu --hide-scrollbars --window-size=512,512 \
    --default-background-color=00000000 --screenshot="src/icon-512.png" \
    "file://$PWD/$1" 2>/dev/null

  mkdir -p "$2"
  cp src/icon-512.png "$2/apple-touch-icon.png"
  sips -z 180 180 "$2/apple-touch-icon.png" >/dev/null
  for s in 48 32 16; do sips -z $s $s src/icon-512.png --out "src/icon-$s.png" >/dev/null; done

  node -e '
  const fs=require("fs");
  // ICO: 6-byte header, then one 16-byte directory entry per image, then the
  // PNG payloads. width/height of 0 would mean 256; ours are all smaller.
  const sizes=[16,32,48], out=process.argv[1];
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
  fs.writeFileSync(`${out}/favicon.ico`,Buffer.concat([head,dir,...imgs]));
  console.log(`${out}/favicon.ico`,fs.statSync(`${out}/favicon.ico`).size,"bytes, sizes",sizes.join("/"));
  ' "$2"
}

node favicon-studio.mjs
render src/favicon-studio.html .

node favicon.mjs
render src/favicon.html scripbook
