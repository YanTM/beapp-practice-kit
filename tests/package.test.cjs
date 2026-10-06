const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('package entry points work for CommonJS and ES modules', async () => {
  const common = require('beapp-practice-planner');
  const esm = await import('beapp-practice-planner');
  assert.equal(esm.default, common);
  assert.equal(esm.createSession, common.createSession);
  assert.equal(common.createSession({ minutes: 2, focus: 'memory' }).tasks.length, 1);
  assert.equal(esm.createWeek({ startDate: '2026-12-29' })[6].date, '2027-01-04');
});
test('publication allowlist contains only the utility and documentation', () => {
  const pkg = require('../package.json');
  const allowed = ['planner.js', 'index.mjs', 'index.d.ts', 'index.d.mts',
    'API.md', 'guide.md', 'README.md', 'LICENSE'];
  assert.deepEqual(pkg.files.slice().sort(), allowed.slice().sort());
  for (const file of allowed) assert.ok(fs.existsSync(path.join(__dirname, '..', file)));
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.publishConfig.registry, 'https://registry.npmjs.org/');
  assert.equal(pkg.publishConfig.access, 'public');
});
