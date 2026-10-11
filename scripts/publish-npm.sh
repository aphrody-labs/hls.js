#!/bin/bash
set -euo pipefail
name="$(bun -e 'console.log((await Bun.file("package.json").json()).name)')"
if [[ "$name" != "@aphrody/hls.js" ]]; then
  echo 'Refusing publication outside the owned fork namespace' >&2
  exit 1
fi
bun publish --access public "$@"
