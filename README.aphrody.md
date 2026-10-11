# Aphrody hls.js fork

Based on upstream `video-dev/hls.js` tag `v1.7.3`, commit
`e5ff3583965e3af16c4a4b4d2b5f7bd1ffb5b7de`. Upstream Apache-2.0 licensing,
Dailymotion copyright and author notices are preserved. This fork changes the
development toolchain, not browser playback APIs. Bun 1.4.4 from aphrody-labs/bun
owns scripts, builds and browser-test launchers. Browser MediaSource, Worker,
text tracks and EME remain browser APIs.

Use `bun install --frozen-lockfile --ignore-scripts`, `bun run build:ci`,
`bun run type-check`, `bun run lint`, and `bun run test:unit`. The unit suite runs
in isolated Chrome through a native Bun.serve harness with Mocha and the complete
upstream test bundle; it is not replaced with DOM shims.
Functional Sauce/BrowserStack tests still require their own authorized accounts.

The full bundle retains audio tracks, subtitles/captions, ABR, content steering,
low latency and worker support. EME code availability does not enable DRM:
`emeEnabled` remains false and no license server, credentials or rights are added.
ESM users must host `dist/hls.worker.js` and set `workerPath` explicitly to use it.

Shenron pins this repository as `vendor/hls.js` and consumes its committed, built
distribution. Initialize only that submodule before installing Shenron. Do not
publish this fork as the upstream global npm name `hls.js`; its owned identity is
`@aphrody/hls.js`. Benchmarks distinguish build time from playback behavior; no
runtime speedup is claimed from replacing the development runtime alone.
