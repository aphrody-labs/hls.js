#!/bin/bash
set -e

if [[ $(git rev-parse --is-shallow-repository) = "true" ]]; then
  # make sure everything is fetched
  git fetch --unshallow
fi

bun install --frozen-lockfile --force
./scripts/set-package-version.sh
bun run lint
bun run type-check
bun run build:ci
bun run docs
./scripts/build-cloudflare.sh
