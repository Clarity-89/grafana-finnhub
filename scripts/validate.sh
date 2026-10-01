#!/usr/bin/env sh
# Runs the checks the Grafana plugin catalog runs on submission (grafana/plugin-validator) against a fresh
# build, using the catalog's publishing config. Like the catalog, the source scanners see the committed tree.
# Needs Docker; the validator image only ships for amd64. Extra arguments go to the validator (`-strict`, ...).
set -eu
cd "$(dirname "$0")/.."

ID=$(node -p 'require("./src/plugin.json").id')
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

if [ -n "$(git status --porcelain)" ]; then
  echo "warning: uncommitted changes are not part of the validated source" >&2
fi

yarn build
cp -r dist "$WORK/$ID"
(cd "$WORK" && zip -qr "$ID.zip" "$ID")
mkdir "$WORK/source" && git archive HEAD | tar -x -C "$WORK/source"

docker run --rm --pull=always --platform linux/amd64 \
  -v "$WORK/$ID.zip:/archive.zip:ro" \
  -v "$WORK/source:/source_code:ro" \
  -v "$PWD/scripts/plugin-validator.yaml:/config.yaml:ro" \
  grafana/plugin-validator-cli -config /config.yaml -sourceCodeUri file:///source_code "$@" /archive.zip
