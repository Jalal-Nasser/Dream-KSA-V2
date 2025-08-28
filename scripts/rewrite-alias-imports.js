/**
 * scripts/rewrite-alias-imports.js
 *
 * Rewrites relative imports into moved folders to use the project-root alias '@/'.
 * - ./db/... or ../db/...            -> @/src/db/...
 * - ./lib/... or ../lib/...          -> @/lib/...
 * - ./config/... or ../config/...    -> @/config/...
 * - ./env or ../env                  -> @/src/env
 * - app/src/...                      -> @/src/...
 * - app/lib/...                      -> @/lib/...
 *
 * Creates .bak files next to edited files. Skips node_modules, android, ios.
 * Run: node scripts/rewrite-alias-imports.js
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function walk(dir) {
  const res = [];
  if (!fs.existsSync(dir)) return res;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (/(^|\\|\/)node_modules(\\|\/)/.test(full)) continue;
      if (/(^|\\|\/)android(\\|\/)/.test(full)) continue;
      if (/(^|\\|\/)ios(\\|\/)/.test(full)) continue;
      res.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(item)) {
      res.push(full);
    }
  }
  return res;
}

function backupAndWrite(filePath, updated) {
  const bak = filePath + '.bak';
  if (!fs.existsSync(bak)) fs.copyFileSync(filePath, bak);
  fs.writeFileSync(filePath, updated, 'utf8');
}

function rewrite(content) {
  let changed = false;
  const samples = [];
  let out = content;

  function apply(regex, replacer) {
    out = out.replace(regex, (...args) => {
      const match = args[0];
      const before = match;
      const after = replacer(...args);
      if (before !== after) {
        changed = true;
        if (samples.length < 10) samples.push(`${before}  ->  ${after}`);
      }
      return after;
    });
  }

  // ./db or ../db -> @/src/db
  apply(/(from\s+['"])(\.{1,2}\/)+db\/([^'\"]+)(['"])/g, (m, pre, dots, rest, quote) => {
    return pre + `@/src/db/${rest}` + quote;
  });

  // ./lib or ../lib -> @/lib
  apply(/(from\s+['"])(\.{1,2}\/)+lib\/([^'\"]+)(['"])/g, (m, pre, dots, rest, quote) => {
    return pre + `@/lib/${rest}` + quote;
  });

  // ./config or ../config -> @/config
  apply(/(from\s+['"])(\.{1,2}\/)+config\/([^'\"]+)(['"])/g, (m, pre, dots, rest, quote) => {
    return pre + `@/config/${rest}` + quote;
  });

  // ./env or ../env -> @/src/env
  apply(/(from\s+['"])(\.{1,2}\/)+env(['"])/g, (m, pre, dots, quote) => {
    return pre + `@/src/env` + quote;
  });

  // app/src/... -> @/src/...
  apply(/(from\s+['"])app\/src\/([^'\"]+)(['"])/g, (m, pre, rest, quote) => {
    return pre + `@/src/${rest}` + quote;
  });

  // app/lib/... -> @/lib/...
  apply(/(from\s+['"])app\/lib\/([^'\"]+)(['"])/g, (m, pre, rest, quote) => {
    return pre + `@/lib/${rest}` + quote;
  });

  return { changed, out, samples };
}

function main() {
  const files = walk(projectRoot);
  let edits = 0;
  const sampleRewrites = [];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const { changed, out, samples } = rewrite(content);
    if (changed) {
      backupAndWrite(f, out);
      edits++;
      for (const s of samples) {
        if (sampleRewrites.length < 10) sampleRewrites.push(`${path.relative(projectRoot, f)}: ${s}`);
      }
      console.log('Updated imports in:', path.relative(projectRoot, f));
    }
  }
  console.log('Done. Files updated:', edits);
  if (sampleRewrites.length) {
    console.log('Sample rewrites (max 10):');
    for (const s of sampleRewrites) console.log(' -', s);
  }
}

main();


