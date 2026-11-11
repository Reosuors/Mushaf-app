#!/usr/bin/env bash
# Publish one built file to the GitHub Release for this version.
# Usage: scripts/publish-release.sh VERSION LOCAL_FILE ASSET_NAME
# Every build (Android, Windows, macOS) calls this. The first job to arrive creates
# the release v$VERSION, copies the other platforms' files from the previous release
# into it (so the "latest" links never point at a release with a missing file), then
# marks it Latest. Each job then uploads its own fresh file, replacing any copy.
# Permanent links: https://github.com/<owner>/<repo>/releases/latest/download/<ASSET_NAME>
set -uo pipefail
VERSION="$1"; FILE="$2"; NAME="$3"
TAG="v$VERSION"
ALL_ASSETS="Mushaf.apk Mushaf-Setup.exe Mushaf.dmg"
export GH_REPO="${GITHUB_REPOSITORY}"

STAGE="$(mktemp -d)"
cp "$FILE" "$STAGE/$NAME"

for attempt in 1 2 3 4 5; do
  if gh release view "$TAG" >/dev/null 2>&1; then break; fi
  PREV="$(gh release view --json tagName -q .tagName 2>/dev/null || true)"
  if gh release create "$TAG" --title "Mushaf $VERSION" --target "$GITHUB_SHA" --latest=false \
       --notes "Mushaf $VERSION — Android (Mushaf.apk), Windows (Mushaf-Setup.exe), Mac (Mushaf.dmg), Google Play upload (Mushaf.aab). Web: https://mishafapp32.vercel.app"; then
    if [ -n "$PREV" ] && [ "$PREV" != "$TAG" ]; then
      SEED="$(mktemp -d)"
      for a in $ALL_ASSETS; do
        [ "$a" = "$NAME" ] && continue
        gh release download "$PREV" -D "$SEED" -p "$a" >/dev/null 2>&1 || continue
        gh release upload "$TAG" "$SEED/$a" >/dev/null 2>&1 || true   # a fresh build may already be there
      done
      rm -rf "$SEED"
    fi
    break
  fi
  sleep $((attempt * 5))
done

ok=0
for attempt in 1 2 3 4 5; do
  if gh release upload "$TAG" "$STAGE/$NAME" --clobber; then ok=1; break; fi
  sleep $((attempt * 10))
done
[ "$ok" = 1 ] || { echo "upload of $NAME to $TAG failed"; exit 1; }

# Mark this release Latest once it has every file (fresh or carried over from the previous release).
HAVE="$(gh release view "$TAG" --json assets -q '.assets[].name' 2>/dev/null || true)"
missing=0
for a in $ALL_ASSETS; do echo "$HAVE" | grep -qx "$a" || missing=1; done
if [ "$missing" = 0 ]; then gh release edit "$TAG" --latest >/dev/null && echo "$TAG is Latest"; fi
echo "Published $NAME to $TAG"
