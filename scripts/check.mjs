#!/usr/bin/env node
// Look up one GPU by name, alias or slug. No dependencies.
//   node scripts/check.mjs "rtx 4070"
//   node scripts/check.mjs "9070 xt" --json
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { gpus } = JSON.parse(readFileSync(join(root, 'data/gpus.json'), 'utf8'));

const args = process.argv.slice(2);
const json = args.includes('--json');
const query = args.filter((a) => !a.startsWith('--')).join(' ').trim();
if (!query) {
  console.error('usage: node scripts/check.mjs "<gpu name or slug>" [--json]');
  process.exit(2);
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const q = norm(query);

const scored = gpus.map((gpu) => {
  const candidates = [gpu.slug, gpu.name, ...(gpu.aliases ?? [])].map(norm);
  let best = 0;
  for (const c of candidates) {
    if (c === q) best = Math.max(best, 3);
    else if (c.includes(q) || q.includes(c)) best = Math.max(best, 2);
    else if (c.split(' ').every((part) => q.includes(part))) best = Math.max(best, 1);
  }
  return { gpu, best };
});

const hits = scored.filter((s) => s.best > 0).sort((a, b) => b.best - a.best);

if (hits.length === 0) {
  console.log(`No entry for "${query}". Missing hardware is missing, not "unsupported".`);
  console.log('Ask for it: https://github.com/wangsheng1991/dlss5-compatibility-data/issues');
  process.exit(1);
}

const top = hits[0].gpu;
if (json) {
  console.log(JSON.stringify(top, null, 2));
  process.exit(0);
}

const line = (k, v) => console.log(`  ${k.padEnd(22)} ${v}`);
console.log(`\n${top.name} — ${top.generation}${top.vramGb ? `, ${top.vramGb} GB` : ''}`);
line('DLSS 5 overall', top.status);
for (const [key, rec] of Object.entries(top.features ?? {})) {
  line(key, `${rec.status}  (checked ${rec.lastVerified})`);
}
if (top.localSoftware) {
  line('our local software', `${top.localSoftware.fit} — ${top.localSoftware.reason}`);
}
line('last verified', top.lastVerified ?? 'n/a');
line('sources', (top.sources ?? []).map((s) => s.url).join('\n' + ' '.repeat(25)) || 'none');
console.log('\n  unknown = we could not verify it from an official page. Not a "no".');
console.log('  A supported GPU does not enable anything inside a game; the title has to ship it.\n');

if (hits.length > 1) {
  console.log(`  other matches: ${hits.slice(1, 6).map((h) => h.gpu.name).join(', ')}\n`);
}
