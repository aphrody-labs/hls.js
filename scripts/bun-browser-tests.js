// SPDX-License-Identifier: Apache-2.0
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const chrome =
  process.env.CHROME_BIN ||
  Bun.which('google-chrome') ||
  Bun.which('chromium') ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mochaPath = join(resolve('node_modules/mocha'), 'mocha.js');
const nonce = crypto.randomUUID();
let complete;
const result = new Promise((resolveResult) => {
  complete = resolveResult;
});
const html = `<!doctype html><meta charset="utf-8"><div id="mocha"></div>
<script src="/${nonce}/mocha.js"></script><script>mocha.setup({ui:'bdd',timeout:2000});window.__loadErrors=[];window.addEventListener('error',e=>setTimeout(()=>{if(!e.defaultPrevented)window.__loadErrors.push(e.message);},0));</script>
<script src="/${nonce}/suite.js"></script><script>
const failures=[];const runner=mocha.run(()=>{fetch('/${nonce}/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({stats:runner.stats,failures,loadErrors:window.__loadErrors})});});
runner.on('fail',(test,error)=>failures.push({title:test.fullTitle(),message:error.message,stack:String(error.stack||'').slice(0,2048)}));</script>`;
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 0,
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === `/${nonce}/result` && request.method === 'POST') {
      complete(await request.json());
      return new Response('ok');
    }
    if (path === `/${nonce}/`)
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    if (path === `/${nonce}/mocha.js`) return new Response(Bun.file(mochaPath));
    if (path === `/${nonce}/suite.js`)
      return new Response(Bun.file('karma-temp/tests.js'));
    return new Response('Not found', { status: 404 });
  },
});
const temporaryRoot = resolve(tmpdir());
const profile = await mkdtemp(join(temporaryRoot, 'hls-bun-browser-'));
let child;
let timer;
try {
  child = Bun.spawn(
    [
      chrome,
      `--user-data-dir=${profile}`,
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--autoplay-policy=no-user-gesture-required',
      '--no-first-run',
      '--no-default-browser-check',
      `http://127.0.0.1:${server.port}/${nonce}/`,
    ],
    { stdout: 'ignore', stderr: 'ignore' },
  );
  const outcome = await Promise.race([
    result,
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Browser suite timeout after 180 seconds')),
        180000,
      );
    }),
    child.exited.then((code) => {
      throw new Error(`Chrome exited before suite completion (${code})`);
    }),
  ]);
  console.log(JSON.stringify(outcome));
  if (
    !outcome.stats ||
    outcome.stats.tests !== 1202 ||
    outcome.stats.pending !== 0 ||
    outcome.stats.failures ||
    !Array.isArray(outcome.loadErrors) ||
    outcome.loadErrors.length
  )
    process.exitCode = 1;
} finally {
  clearTimeout(timer);
  server.stop(true);
  child?.kill();
  if (child) {
    await Promise.race([child.exited, Bun.sleep(2000)]);
    if (child.exitCode === null) {
      child.kill('SIGKILL');
      await Promise.race([child.exited, Bun.sleep(2000)]);
    }
  }
  if (!resolve(profile).startsWith(temporaryRoot + sep + 'hls-bun-browser-'))
    throw new Error('Unexpected temporary profile path');
  await rm(profile, { recursive: true, force: true });
}
