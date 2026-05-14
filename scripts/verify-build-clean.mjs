import { execFileSync } from 'node:child_process';

const diff = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });

if (diff.trim()) {
  console.error('Build left uncommitted changes:');
  console.error(diff);
  process.exit(1);
}

console.log('Build left the working tree clean.');
