#!/usr/bin/env bash
# Builds the whole site: studio home, the ScripBook page, the shared icons
# and the link preview card.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
node studio.mjs
node build.mjs
./favicon.sh > /dev/null && echo "built favicon.ico, icon.svg, apple-touch-icon.png"
./og.sh > /dev/null && echo "built og.png"
printf 'pritsapps.com\n' > CNAME
# privacy/index.html is a static copy of the policy, deliberately not generated:
# the wording has to match the in-app copy in PrivacySheet.js word for word, and
# a generator would invite them to drift apart.
test -f privacy/index.html && echo "privacy/index.html present (static, not generated)"
echo "CNAME -> pritsapps.com"
