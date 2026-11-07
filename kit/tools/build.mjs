// Packs kit/dev.html, its stylesheet and every ES module it imports (including the
// game's story, game/story.js) into one self-contained index.html at the project root:
// double-click to play, and what GitHub Pages serves.
//
//   node kit/tools/build.mjs                  build the main story (game/story.js -> index.html)
//   node kit/tools/build.mjs --story <name>   build game/<name>.story.js -> game/<name>.html
//   node kit/tools/build.mjs --all            build every story
//   node kit/tools/build.mjs --check          exit 1 if any story's page is out of date
//
// This is a deliberately small bundler for this project's own code. It understands
// named and default imports, `export function|const|let|class`, `export default`
// and `export { a, b }`. Anything fancier fails the build loudly.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { storyFile, storyFiles } from './stories.mjs';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // kit/
const project = path.dirname(root);
const rel = (p) => path.relative(project, p).split(path.sep).join('/');

const IMPORT = /^import\s+(?:\{([^}]*)\}|(\w+))\s+from\s+'([^']+)';?\s*$/gm;
const EXPORT_DECL = /^export\s+(?:async\s+)?(function\*?|const|let|class)\s+(\w+)/gm;
const EXPORT_LIST = /^export\s*\{([^}]*)\};?\s*$/gm;
const EXPORT_DEFAULT = /^export\s+default\s+/m;

// `alias` swaps one module file for another (the main story for the one being built).
async function bundle(entry, alias = new Map()) {
  const order = [];
  const seen = new Set();
  const modules = new Map();

  async function load(file) {
    if (seen.has(file)) return;
    seen.add(file);
    const src = await readFile(file, 'utf8');
    const deps = [];
    let body = src.replace(IMPORT, (_, named, def, spec) => {
      const resolved = path.resolve(path.dirname(file), spec);
      const dep = alias.get(resolved) ?? resolved;
      deps.push(dep);
      const ref = `__modules[${JSON.stringify(rel(dep))}]`;
      if (def) return `const ${def} = ${ref}.default;`;
      const names = named.split(',').map((s) => s.trim()).filter(Boolean)
        .map((s) => s.replace(/\s+as\s+/, ': '));
      return `const { ${names.join(', ')} } = ${ref};`;
    });
    const exported = [];
    body = body.replace(EXPORT_DECL, (m, kind, name) => {
      exported.push(name);
      return m.replace(/^export\s+/, '');
    });
    body = body.replace(EXPORT_LIST, (_, list) => {
      exported.push(...list.split(',').map((s) => s.trim()).filter(Boolean));
      return '';
    });
    if (EXPORT_DEFAULT.test(body)) {
      body = body.replace(EXPORT_DEFAULT, 'const __default = ');
      exported.push('default: __default');
    }
    if (/^\s*(import|export)\b/m.test(body)) {
      throw new Error(`${rel(file)}: unsupported import/export form left after bundling`);
    }
    for (const dep of deps) await load(dep);
    modules.set(file, { body, exported });
    order.push(file);
  }

  await load(entry);
  const parts = order.map((file) => {
    const { body, exported } = modules.get(file);
    return `// ${rel(file)}\n__modules[${JSON.stringify(rel(file))}] = (() => {\n${body.trim()}\nreturn { ${exported.join(', ')} };\n})();`;
  });
  return `(() => {\n'use strict';\nconst __modules = {};\n${parts.join('\n\n')}\n})();`;
}

async function build(target) {
  let html = await readFile(path.join(root, 'dev.html'), 'utf8');

  html = await replaceAsync(html, /<link rel="stylesheet" href="([^"]+)">/g, async (_, href) => {
    const css = await readFile(path.join(root, href), 'utf8');
    return `<style>\n${css.trim()}\n</style>`;
  });

  html = await replaceAsync(html, /<script type="module" src="([^"]+)"><\/script>/g, async (_, src) => {
    const js = await bundle(path.join(root, src), new Map([[storyFile(project, 'story').file, target.file]]));
    return `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`;
  });

  if (/<link rel="stylesheet"|type="module"/.test(html)) throw new Error('dev.html has a stylesheet or module the build did not inline');
  const { default: story } = await import(`${pathToFileURL(target.file).href}?t=${Date.now()}`);
  const title = story.game?.title;
  if (title) html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  return `<!-- Built from kit/dev.html and ${target.rel} by kit/tools/build.mjs. Edit in the story editor, or run npm run build. -->\n${html}`;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function replaceAsync(str, re, fn) {
  const jobs = [];
  str.replace(re, (...args) => { jobs.push(fn(...args)); return ''; });
  const results = await Promise.all(jobs);
  let i = 0;
  return str.replace(re, () => results[i++]);
}

const arg = (flag) => { const i = process.argv.indexOf(flag); return i > 0 ? process.argv[i + 1] : null; };
const check = process.argv.includes('--check');
const targets = check || process.argv.includes('--all')
  ? await storyFiles(project)
  : [storyFile(project, arg('--story') ?? 'story')];
if (targets.some((t) => !t)) {
  console.error('Story names use lowercase letters, digits and dashes.');
  process.exit(1);
}
let stale = 0;
for (const target of targets) {
  const built = await build(target);
  if (check) {
    const current = await readFile(target.page, 'utf8').catch(() => '');
    if (current !== built) {
      console.log(`${target.pageRel} is out of date. Run: npm run build -- --all`);
      stale++;
    }
  } else {
    await writeFile(target.page, built);
    console.log(`Wrote ${target.pageRel} (${(built.length / 1024).toFixed(1)} KB)`);
  }
}
if (check) {
  if (stale) process.exit(1);
  console.log(`${targets.length === 1 ? 'The page is' : 'Every page is'} up to date.`);
}
