#!/usr/bin/env node
// Enforces the one rule this dataset lives on: a non-unknown status must carry an
// official source and a date somebody actually looked. Exits non-zero on violation.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { gpus } = JSON.parse(readFileSync(join(root, 'data/gpus.json'), 'utf8'));

const errors = [];
const seen = new Set();
const date = /^\d{4}-\d{2}-\d{2}$/;

for (const gpu of gpus) {
  const where = gpu.slug ?? '(no slug)';
  if (!gpu.slug || !/^[a-z0-9-]+$/.test(gpu.slug)) errors.push(`${where}: bad slug`);
  if (seen.has(gpu.slug)) errors.push(`${where}: duplicate slug`);
  seen.add(gpu.slug);
  if (!['nvidia', 'amd', 'intel'].includes(gpu.vendor)) errors.push(`${where}: bad vendor`);

  const check = (label, rec) => {
    if (!rec) return errors.push(`${where}/${label}: missing`);
    if (!['confirmed', 'planned', 'unsupported', 'unknown'].includes(rec.status)) {
      return errors.push(`${where}/${label}: bad status ${rec.status}`);
    }
    if (rec.status === 'unknown') return;
    if (!(rec.sources ?? []).length) errors.push(`${where}/${label}: status ${rec.status} without a source`);
    if (!date.test(rec.lastVerified ?? '')) errors.push(`${where}/${label}: lastVerified is not YYYY-MM-DD`);
    for (const s of rec.sources ?? []) {
      if (!/^https:\/\//.test(s.url ?? '')) errors.push(`${where}/${label}: source is not an https URL`);
      if (!date.test(s.checkedAt ?? '')) errors.push(`${where}/${label}: source checkedAt is not YYYY-MM-DD`);
    }
  };

  check('overall', gpu);
  for (const [key, rec] of Object.entries(gpu.features ?? {})) check(key, rec);
}

if (errors.length) {
  console.error(`FAIL — ${errors.length} problem(s)`);
  for (const e of errors) console.error('  ' + e);
  process.exit(1);
}

const counts = gpus.reduce((acc, g) => ((acc[g.status] = (acc[g.status] ?? 0) + 1), acc), {});
console.log(`OK — ${gpus.length} GPUs, every non-unknown status carries an official source`);
console.log('   ' + Object.entries(counts).map(([k, v]) => `${k}=${v}`).join('  '));
