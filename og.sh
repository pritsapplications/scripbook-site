#!/usr/bin/env bash
# Renders the Open Graph card at 2x. Declared dimensions in the meta tags must
# match the file, so build.mjs states 2400x1260, not the 1200x630 layout size.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
node og.mjs
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=2 --window-size=1200,630 \
  --screenshot=og.png "file://$PWD/src/og.html" 2>/dev/null
sips -g pixelWidth -g pixelHeight og.png | grep pixel
