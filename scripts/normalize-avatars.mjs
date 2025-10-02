#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

const AGENTS_DIR = path.join(process.cwd(), 'public', 'agents');
const sources = [
  path.join(AGENTS_DIR, 'ezra'),
  path.join(AGENTS_DIR, 'ezra.png'),
];
const target = path.join(AGENTS_DIR, 'ezra.jpg');

async function main() {
  try {
    await fs.access(AGENTS_DIR);
  } catch {
    console.log('[normalize-avatars] agents directory not found, skipping.');
    return;
  }

  const source = await findSource();
  if (!source) {
    console.log('[normalize-avatars] no ezra file requiring normalization.');
    return;
  }

  if (await exists(target)) {
    console.log('[normalize-avatars] ezra.jpg already exists, skipping rename.');
    return;
  }

  try {
    // Simple JPEG magic number check (FF D8)
    const handle = await fs.open(source, 'r');
    const buffer = Buffer.alloc(2);
    await handle.read(buffer, 0, 2, 0);
    await handle.close();
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
    if (!isJpeg) {
      console.log('[normalize-avatars] ezra file did not look like a JPEG, leaving as-is.');
      return;
    }
  } catch (error) {
    console.log('[normalize-avatars] unable to inspect ezra file, skipping.', error.message);
    return;
  }

  try {
    await fs.rename(source, target);
    console.log('[normalize-avatars] renamed ezra -> ezra.jpg');
  } catch (error) {
    console.log('[normalize-avatars] failed to rename ezra file:', error.message);
  }
}

async function findSource() {
  for (const candidate of sources) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

main();
