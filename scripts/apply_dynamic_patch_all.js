const fs = require('fs');
const path = require('path');
const glob = require('glob');
const pattern = "export const dynamic = 'force-dynamic'";
const root = process.cwd();
const files = glob.sync('app/api/**/*.ts', { cwd: root, nodir: true });
let updated = 0;
for (const file of files) {
  const full = path.join(root, file);
  const text = fs.readFileSync(full, 'utf8');
  if (text.includes(pattern)) continue;
  const lines = text.split(/\r?\n/);
  let insertAt = 0;
  while (insertAt < lines.length && /^\s*import\s+/.test(lines[insertAt])) insertAt++;
  lines.splice(insertAt, 0, pattern);
  fs.writeFileSync(full, lines.join('\n') + '\n', 'utf8');
  updated++;
  console.log('Updated', file);
}
console.log('Done; updated', updated, 'files');
