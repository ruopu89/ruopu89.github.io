#!/usr/bin/env bash
# Rebuild the EasyEnglish section of the Hexo site from talk-with-hermes,
# then deploy the built public/ to the Pages branch (master) over HTTPS.
#
#   bash deploy-easyenglish.sh           # full pipeline, pushes master
#   bash deploy-easyenglish.sh no-push  # build + mirror master checkout, but skip the push
#
# The push token is read at runtime from the talk-with-hermes git config; it is
# NOT stored in this repo.
set -euo pipefail

REPO="${REPO:-$PWD}"
TWH="${TALK_WITH_HERMES:-$HOME/talk-with-hermes}"
MASTER="${MASTER:-$(cd "$(dirname "$REPO")" && pwd)/ruopu89.github.io-master}"
PROXY="${PROXY:-}"
NO_PUSH="${1:-}"

[ -d "$REPO/.git" ] || { echo "REPO is not a git checkout: $REPO"; exit 1; }
[ -d "$TWH/.git" ]  || { echo "talk-with-hermes not found at $TWH (set TALK_WITH_HERMES)"; exit 1; }
if [ -n "$PROXY" ]; then
  export http_proxy="http://$PROXY" https_proxy="http://$PROXY"
  export HTTP_PROXY="http://$PROXY" HTTPS_PROXY="http://$PROXY"
fi

echo "[1/5] git pull talk-with-hermes"
git -C "$TWH" pull --ff-only

echo "[2/5] sync lessons -> source/easyenglish/newconceptenglish"
cd "$REPO"
node tools/sync-easyenglish.js

echo "[3/5] hexo clean + generate"
npm install --no-audit --no-fund --loglevel=error
npx hexo clean
npx hexo generate

# one-time master checkout for deploying the built output
if [ ! -d "$MASTER/.git" ]; then
  echo "       (cloning master deploy checkout -> $MASTER)"
  git clone --depth 1 --branch master \
    -c http.proxy="$PROXY" -c https.proxy="$PROXY" \
    https://github.com/ruopu89/ruopu89.github.io.git "$MASTER"
  git -C "$MASTER" config http.proxy "$PROXY"
  git -C "$MASTER" config https.proxy "$PROXY"
fi

echo "[4/5] mirror public/ -> master checkout"
cd "$MASTER"
git fetch origin master
git checkout master
# wipe generated working tree (keep .git), then mirror the fresh build
find . -mindepth 1 -not -path './.git' -not -path './.git/*' -exec rm -rf {} + 2>/dev/null || true
cp -r "$REPO/public/." .
git add -A
if git diff --cached --quiet; then
  echo "       no changes to master (up to date)"
elif [ "$NO_PUSH" = "no-push" ]; then
  git commit -m "deploy: EasyEnglish rebuild $(date '+%Y-%m-%d %H:%M')"
  echo "       committed locally (no-push)"
else
  git commit -m "deploy: EasyEnglish rebuild $(date '+%Y-%m-%d %H:%M')"
fi

if [ "$NO_PUSH" = "no-push" ]; then
  echo "[5/5] skip push (no-push)"
  exit 0
fi

echo "[5/5] push master"
TOK="${GITHUB_TOKEN:-$(git -C "$TWH" config --get remote.origin.url | sed -E 's#https://[^:]+:([^@]+)@.*#\1#' 2>/dev/null || true)}"
if [ -n "${TOK:-}" ]; then
  git push "https://ruopu89:${TOK}@github.com/ruopu89/ruopu89.github.io.git" master
else
  git push origin master
fi
echo "done."
