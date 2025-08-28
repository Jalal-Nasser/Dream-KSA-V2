// (If you already created this earlier, this will overwrite with the same logic)
// Run: node scripts/fix-imports.js
const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
const appDir = path.join(projectRoot, 'app');

function walk(dir) {
  const res = [];
  if (!fs.existsSync(dir)) return res;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      res.push(...walk(full));
    } else if (stat.isFile() && /\.(js|ts|tsx|jsx)$/.test(item)) {
      res.push(full);
    }
  }
  return res;
}

function relativeImportFor(filePath, targetAbsPath) {
  const fromDir = path.dirname(filePath);
  let rel = path.relative(fromDir, targetAbsPath);
  if (!rel.startsWith('.')) rel = './' + rel;
  rel = rel.replace(/\.tsx?$|\.jsx?$/, '');
  return rel.split(path.sep).join('/');
}

function transformContent(filePath, content) {
  let changed = false;
  let newContent = content.replace(/(from\s+['"])(\.\.\/)+src\/([^'\"]+)(['"])/g, (m, pre, dots, rest, quote) => {
    const targetAbs = path.join(projectRoot, 'src', rest);
    const newRel = relativeImportFor(filePath, targetAbs);
    changed = true;
    return pre + newRel + quote;
  });

  newContent = newContent.replace(/(from\s+['"])(\.\.\/)+lib\/([^'\"]+)(['"])/g, (m, pre, dots, rest, quote) => {
    const targetAbs = path.join(projectRoot, 'lib', rest);
    const newRel = relativeImportFor(filePath, targetAbs);
    changed = true;
    return pre + newRel + quote;
  });

  newContent = newContent.replace(/(from\s+['"])(\.\.\/)+config\/([^'\"]+)(['"])/g, (m, pre, dots, rest, quote) => {
    const targetAbs = path.join(projectRoot, 'config', rest);
    const newRel = relativeImportFor(filePath, targetAbs);
    changed = true;
    return pre + newRel + quote;
  });

  newContent = newContent.replace(/(from\s+['"])(src\/[^"]+)(['"])/g, (m, pre, importPath, quote) => {
    const targetAbs = path.join(projectRoot, importPath);
    const newRel = relativeImportFor(filePath, targetAbs);
    changed = true;
    return pre + newRel + quote;
  });

  return { changed, newContent };
}

function backupAndWrite(filePath, updated) {
  const bak = filePath + '.bak';
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(filePath, bak);
  }
  fs.writeFileSync(filePath, updated, 'utf8');
}

function main() {
  console.log('Scanning project files under app/ and root...');
  const files = walk(projectRoot);
  let edits = 0;
  for (const f of files) {
    if (f.includes(`${path.sep}node_modules${path.sep}`)) continue;
    const content = fs.readFileSync(f, 'utf8');
    const { changed, newContent } = transformContent(f, content);
    if (changed && newContent !== content) {
      backupAndWrite(f, newContent);
      edits++;
      console.log('Updated imports in:', path.relative(projectRoot, f));
    }
  }
  console.log('Done. Files updated:', edits);
}

main();


