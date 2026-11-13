// coolest-art-01 entry (Node 22, standard library only): one piece of art,
// entry.png beside this file, written to /output/entry.png byte for byte.
// Before writing, the program checks the file is really a PNG (its magic
// bytes) and fits the gate (at most 1 MiB, at most 1024 by 1024 pixels,
// read from the IHDR chunk), so a bad file fails loudly instead of
// submitting something the gate would refuse. The copy is deterministic:
// both grading runs write the identical bytes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'entry.png');
const out = join(process.env.MAKEFUN_OUTPUT_DIR ?? '/output', 'entry.png');

const buf = readFileSync(src);
if (buf.length > 1048576) {
  throw new Error(`entry.png is ${buf.length} bytes, over the 1 MiB gate`);
}
// PNG signature: 89 50 4E 47 0D 0A 1A 0A
const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(sig)) {
  throw new Error('entry.png is not a PNG file');
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (buf.toString('ascii', 12, 16) !== 'IHDR') {
  throw new Error('entry.png has no IHDR chunk where a PNG should');
}
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 gate`);
}
writeFileSync(out, buf);
console.log(`wrote ${out} (${width}x${height}, ${buf.length} bytes)`);
