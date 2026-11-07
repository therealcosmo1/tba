// Packs the kit as a new, empty project that others can download and use:
//
//   npm run package [-- <version>]    writes dist/kit-<version>.zip
//
// The zip has the same layout as this project (package.json, kit/, game/, index.html),
// but game/story.js is the starter story (kit/starter/story.js), never this game's.
// Tests that use this game's own test room (hall) are left out. Needs `zip` (macOS, Linux).
import { cp, mkdir, rm, readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const kit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(kit);
const version = (process.argv[2] ?? 'dev').replace(/^kit-v/, '');
const name = `kit-${version}`;
const stage = path.join(await mkdtemp(path.join(os.tmpdir(), 'kit-')), name);

const LEFT_OUT = ['tests/hall.test.txt', 'tests/fixtures/hall.js', 'tests/fixtures/hall-story.js'];
await cp(kit, path.join(stage, 'kit'), {
  recursive: true,
  filter: (src) => !LEFT_OUT.includes(path.relative(kit, src).split(path.sep).join('/')) && !src.endsWith('.DS_Store'),
});
await mkdir(path.join(stage, 'game'));
await cp(path.join(kit, 'starter', 'story.js'), path.join(stage, 'game', 'story.js'));

const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
pkg.name = 'my-game';
await writeFile(path.join(stage, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
await cp(path.join(kit, 'README.md'), path.join(stage, 'README.md'));
await cp(path.join(root, 'LICENSE'), path.join(stage, 'LICENSE'));
await writeFile(path.join(stage, '.gitignore'), '.DS_Store\nnode_modules/\ndist/\n*.log\n');
await writeFile(path.join(stage, '.nojekyll'), '');

const node = process.execPath;
execFileSync(node, [path.join(stage, 'kit', 'tools', 'build.mjs')], { stdio: 'inherit' });
execFileSync(node, [path.join(stage, 'kit', 'tests', 'run.mjs')], { stdio: 'inherit' });

const out = path.join(root, 'dist', `${name}.zip`);
await mkdir(path.dirname(out), { recursive: true });
await rm(out, { force: true });
execFileSync('zip', ['-qr', out, name], { cwd: path.dirname(stage) });
await rm(path.dirname(stage), { recursive: true, force: true });
console.log(`Wrote ${path.relative(root, out)}`);
