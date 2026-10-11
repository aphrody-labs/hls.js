// SPDX-License-Identifier: Apache-2.0
// Bun omits parameter comments in Function#toString. Karma 6.4.4 uses a comment
// to inject config.proxies; retain that exact upstream dependency annotation.
const proxy = require('karma/lib/middleware/proxy');
proxy.create.$inject = ['config', 'config.proxies', 'emitter'];
