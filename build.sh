#!/usr/bin/env bash
# Builds the whole site: studio home, the ScripBook page, both icon sets
# and both link preview cards.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
node studio.mjs
node build.mjs
./favicon.sh > /dev/null && echo "built icons: p.a at the root, S grid in scripbook/"
./og.sh > /dev/null && echo "built og.png and scripbook/og.png"
printf 'pritsapps.com\n' > CNAME
# The privacy pages are static, deliberately not generated. Each app keeps its
# own: scripbook/privacy/ has to match the in-app copy in PrivacySheet.js word
# for word, and a generator would invite them to drift apart. privacy/ is only
# a chooser that links to each app's policy; the studio has none of its own.
for f in privacy/index.html scripbook/privacy/index.html decide-already/privacy/index.html; do
  test -f "$f" && echo "$f present (static, not generated)"
done
echo "CNAME -> pritsapps.com"
