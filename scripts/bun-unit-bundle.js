// SPDX-License-Identifier: Apache-2.0
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { rollup } = require('rollup');
const { buildRollupConfig, BUILD_TYPE, FORMAT } = require('../build-config');
const config = buildRollupConfig({
  input: './tests/index.js',
  type: BUILD_TYPE.full,
  format: FORMAT.iife,
  minified: false,
  allowCircularDeps: true,
  includeCoverage: false,
  sourcemap: false,
  outputFile: 'karma-temp/tests.js',
});
const bundle = await rollup(config);
try {
  await bundle.write(config.output);
} finally {
  await bundle.close();
}
