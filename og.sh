#!/usr/bin/env bash
# Renders both Open Graph cards at 2x. The declared dimensions in the meta
# tags must match these files, so build.mjs and studio.mjs state 2400x1260.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

node og.mjs --studio
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1200,630 --screenshot=og.png "file://$PWD/src/og-studio.html" 2>/dev/null

node og.mjs
mkdir -p scripbook
"$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=1200,630 --screenshot=scripbook/og.png "file://$PWD/src/og.html" 2>/dev/null

for f in og.png scripbook/og.png; do
  printf "%-20s %s\n" "$f" "$(sips -g pixelWidth -g pixelHeight "$f" | awk '/pixel/{printf "%s ",$2}')"
done
