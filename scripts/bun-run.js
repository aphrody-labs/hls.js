// SPDX-License-Identifier: Apache-2.0
import { dirname, join } from 'node:path';

const commands = {
  rollup: ['rollup', 'dist/bin/rollup'],
  tsc: ['typescript', 'lib/tsc.js'],
  api: ['@microsoft/api-extractor', 'bin/api-extractor'],
  karma: ['karma', 'bin/karma'],
  mocha: ['mocha', 'bin/mocha.js'],
  eslint: ['eslint', 'bin/eslint.js'],
  prettier: ['prettier', 'bin/prettier.cjs'],
  doctoc: ['doctoc', 'doctoc.js'],
  apiDocumenter: ['@microsoft/api-documenter', 'bin/api-documenter'],
  generateMd: ['markdown-styles', 'bin/generate-md'],
  lintStaged: ['lint-staged', 'bin/lint-staged.js'],
  httpServer: ['http-server', 'bin/http-server'],
  esCheck: ['es-check', 'lib/cli/index.js'],
};
const name = process.argv[2];
if (name === 'copy-types') {
  const bytes = await Bun.file('dist/hls.d.ts').arrayBuffer();
  await Promise.all(
    ['dist/hls.d.mts', 'dist/hls.js.d.ts'].map((path) =>
      Bun.write(path, bytes),
    ),
  );
} else {
  const command = commands[name];
  if (!command) throw new Error(`Unknown tool ${name}`);
  const [pkg, relative] = command;
  const root = dirname(Bun.resolveSync(`${pkg}/package.json`, process.cwd()));
  const preload =
    name === 'karma'
      ? ['--preload', join(import.meta.dir, 'karma-bun.cjs')]
      : [];
  const child = Bun.spawn(
    [
      process.execPath,
      ...preload,
      join(root, relative),
      ...process.argv.slice(3),
    ],
    {
      cwd: process.cwd(),
      env: process.env,
      stdout: 'inherit',
      stderr: 'inherit',
      stdin: 'inherit',
    },
  );
  process.exit(await child.exited);
}
