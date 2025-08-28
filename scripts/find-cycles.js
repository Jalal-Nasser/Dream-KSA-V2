// Detect circular import cycles by scanning TS/JS imports (simple static DFS).
// Usage: node scripts/find-cycles.js
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const IGNORED = ['node_modules', '.git', '.expo', 'android', 'ios'];

function walk(dir) {
  let out = [];
  const items = fs.readdirSync(dir);
  for (const it of items) {
    if (IGNORED.includes(it)) continue;
    const full = path.join(dir, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out = out.concat(walk(full));
    else if (/\.(js|ts|tsx|jsx)$/.test(it)) out.push(full);
  }
  return out;
}

function parseImports(file) {
  const src = fs.readFileSync(file, 'utf8');
  const re = /import\s+(?:.+?\s+from\s+)?['\"](.+?)['\"]/g;
  const imports = [];
  let m;
  while ((m = re.exec(src))) {
    imports.push(m[1]);
  }
  return imports;
}

function resolveImport(fromFile, imp) {
  if (imp.startsWith('.') || imp.startsWith('..')) {
    const base = path.dirname(fromFile);
    const candidates = [
      path.resolve(base, imp + '.ts'),
      path.resolve(base, imp + '.tsx'),
      path.resolve(base, imp + '.js'),
      path.resolve(base, imp + '.jsx'),
      path.resolve(base, imp, 'index.ts'),
      path.resolve(base, imp, 'index.tsx'),
      path.resolve(base, imp, 'index.js'),
      path.resolve(base, imp, 'index.jsx'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return path.relative(projectRoot, c);
    }
    return null;
  } else {
    // ignore absolute package imports
    return null;
  }
}

function buildGraph() {
  const files = walk(projectRoot);
  const graph = new Map();
  for (const f of files) {
    const rel = path.relative(projectRoot, f);
    const imps = parseImports(f);
    const edges = [];
    for (const imp of imps) {
      const r = resolveImport(f, imp);
      if (r) edges.push(r);
    }
    graph.set(rel, edges);
  }
  return graph;
}

function findCycles(graph) {
  const nodes = Array.from(graph.keys());
  const visited = new Set();
  const stack = [];
  const cycles = [];

  function dfs(node, ancestors) {
    if (ancestors.includes(node)) {
      const cycle = ancestors.slice(ancestors.indexOf(node)).concat(node);
      cycles.push(cycle);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    const children = graph.get(node) || [];
    for (const c of children) {
      if (!graph.has(c)) continue;
      dfs(c, ancestors.concat(node));
    }
  }

  for (const n of nodes) {
    dfs(n, []);
  }
  return cycles;
}

function main() {
  console.log('Building import graph (this may take a few seconds)...');
  const graph = buildGraph();
  console.log('Graph nodes:', graph.size);
  const cycles = findCycles(graph);
  if (cycles.length === 0) {
    console.log('✅ No circular import cycles found (static scan).');
  } else {
    console.log('🚨 Circular import cycles detected:', cycles.length);
    for (const c of cycles) {
      console.log('--- cycle ---');
      for (const p of c) console.log(' ', p);
    }
  }
}

main();



