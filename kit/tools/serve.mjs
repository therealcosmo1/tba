// Local development server: serves the project folder and lets the story editor save.
//
//   npm start   then open  http://localhost:8767/kit/editor/      (story editor)
//                          http://localhost:8767/kit/dev.html     (game from source)
//                          http://localhost:8767/                 (the built game, index.html)
//
//   GET  /api/stories  the game's stories: game/story.js (the main one, built to
//                      index.html) and game/<name>.story.js (built to game/<name>.html)
//   GET  /api/story?name=<name>   one story's data, with its version (default: the main one)
//   POST /api/story    { name, story, version } writes it and rebuilds its page. Refused if
//                      the file changed since the editor loaded it (an older tab, or Claude).
//                      { name, story, create: true } makes a new story ("Save as", "New").
//   GET  /api/publish  whether Publish is possible here (a git repository, a remote)
//   POST /api/publish  run the tests, commit game/story.js and index.html as a
//                      "Game:" commit, and push it if there is a remote
//
// Listens on 127.0.0.1 only. No dependencies.
import http from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { storyFiles, storyFile } from './stories.mjs';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const kit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(kit); // the project: package.json, index.html, game/, kit/

const PORT = Number(process.env.PORT) || 8767;
const HEADER =
  '// Written by the story editor (npm start, then /kit/editor/). Edit it there.\n';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

async function readStory(name) {
  const src = await readFile(storyFile(root, name).file, 'utf8');
  const start = src.indexOf('export default');
  return { story: JSON.parse(src.slice(src.indexOf('{', start), src.lastIndexOf('}') + 1)), version: versionOf(src) };
}

const versionOf = (src) => createHash('sha1').update(src).digest('hex').slice(0, 12);

function validStory(s) {
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const optional = (v) => v === undefined || isObj(v);
  return isObj(s) && isObj(s.actors) && isObj(s.events) && optional(s.locations) && optional(s.passages) && optional(s.objects) && optional(s.areas) && optional(s.areaOf) && optional(s.game) && optional(s.layout);
}

// Runs a command in the project folder: { ok, out } with stdout and stderr together.
function run(cmd, args) {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: root, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ ok: !err, out: `${stdout}${stderr}`.trim() || (err ? err.message : '') });
    });
  });
}

async function rebuild(name) {
  const r = await run(process.execPath, [path.join(kit, 'tools', 'build.mjs'), '--story', name]);
  return { ok: r.ok, message: r.out };
}

const git = (...args) => run('git', args);
const GAME_FILES = ['game', 'index.html'];

async function publishInfo() {
  const repo = await git('rev-parse', '--is-inside-work-tree');
  if (!repo.ok) return { git: false, remote: false };
  const remote = await git('remote', 'get-url', 'origin');
  const branch = await git('rev-parse', '--abbrev-ref', 'HEAD');
  return { git: true, remote: remote.ok, branch: branch.out };
}

// Publish: tests, then a "Game:" commit of the story and the built game only, then push.
// Kit changes are never swept in: if kit/ has uncommitted changes the built index.html
// would include them, so publishing waits until they are committed or undone.
async function publish(message) {
  const info = await publishInfo();
  if (!info.git) return { ok: false, message: 'This folder is not a git repository, so there is nothing to publish to. Run git init (and add a GitHub remote) first.' };
  const kitChanges = await git('status', '--porcelain', '--', 'kit', 'package.json');
  if (kitChanges.out) {
    return { ok: false, message: `The kit has changes that aren't committed, and the built game would include them. Commit them first as a "Kit:" commit:\n${kitChanges.out}` };
  }
  const build = await run(process.execPath, [path.join(kit, 'tools', 'build.mjs'), '--all']);
  if (!build.ok) return { ok: false, message: `The build failed:\n${build.out}` };
  const tests = await run(process.execPath, [path.join(kit, 'tests', 'run.mjs')]);
  if (!tests.ok) return { ok: false, message: `The tests failed.\n${tests.out.split('\n').slice(-30).join('\n')}` };
  const changed = await git('status', '--porcelain', '--', ...GAME_FILES);
  let committed = false;
  if (changed.out) {
    const subject = (message || 'Update the game').replace(/\s+/g, ' ').trim().replace(/^game:\s*/i, '');
    const commit = await git('commit', '-m', `Game: ${subject}`, '--', ...GAME_FILES);
    if (!commit.ok) return { ok: false, message: `The commit failed:\n${commit.out}` };
    committed = true;
  }
  if (!info.remote) {
    return { ok: true, message: committed ? 'Committed. There is no GitHub remote yet, so nothing was pushed.' : 'Nothing new to publish.' };
  }
  const ahead = await git('rev-list', '--count', '@{u}..HEAD');
  if (!committed && ahead.ok && ahead.out === '0') return { ok: true, message: 'Nothing new to publish.' };
  const push = await git('push', 'origin', 'HEAD');
  if (!push.ok) return { ok: false, message: `${committed ? 'Committed, but the' : 'The'} push failed:\n${push.out}` };
  return { ok: true, message: `Published to ${info.branch}. GitHub Pages updates in a minute or two.` };
}

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/stories') {
      const list = await Promise.all((await storyFiles(root)).map(async (s) => {
        const { story } = await readStory(s.name).catch(() => ({ story: {} }));
        return { name: s.name, main: s.main, file: s.rel, page: s.pageRel, title: story.game?.title || s.name };
      }));
      return send(res, 200, list);
    }
    if (url.pathname === '/api/story') {
      const name = url.searchParams.get('name') || 'story';
      if (req.method === 'GET') {
        if (!storyFile(root, name)) return send(res, 400, { ok: false, message: `"${name}" isn't a story name.` });
        return send(res, 200, await readStory(name).catch(() => null) ?? { story: null });
      }
      if (req.method === 'POST') {
        const body = JSON.parse(await readBody(req));
        const target = storyFile(root, body.name || 'story');
        if (!target) return send(res, 400, { ok: false, message: 'Story names use lowercase letters, digits and dashes.' });
        if (!validStory(body.story)) return send(res, 400, { ok: false, message: 'Story must have "actors" and "events" objects.' });
        const exists = !!(await stat(target.file).catch(() => null));
        if (body.create) {
          if (exists) return send(res, 409, { ok: false, message: `There is already a story called "${target.name}".` });
        } else {
          const current = exists ? await readStory(target.name) : null;
          if (!current || body.version !== current.version) {
            return send(res, 409, { ok: false, message: `${target.rel} changed since this page loaded. Reload the editor to pick up the changes (this discards edits made here since the last save).` });
          }
        }
        const src = `${HEADER}export default ${JSON.stringify(body.story, null, 2)};\n`;
        await writeFile(target.file, src);
        const build = await rebuild(target.name);
        return send(res, 200, { ok: true, build, version: versionOf(src), name: target.name, page: target.pageRel });
      }
      return send(res, 405, { ok: false, message: 'Use GET or POST.' });
    }
    if (url.pathname === '/api/publish') {
      if (req.method === 'GET') return send(res, 200, await publishInfo());
      if (req.method === 'POST') {
        const { message } = JSON.parse((await readBody(req)) || '{}');
        return send(res, 200, await publish(typeof message === 'string' ? message : ''));
      }
      return send(res, 405, { ok: false, message: 'Use GET or POST.' });
    }

    let file = path.join(root, decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) && file !== root) return send(res, 403, 'Forbidden', 'text/plain');
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${url.pathname}/` });
        return res.end();
      }
      file = path.join(file, 'index.html');
    }
    const body = await readFile(file).catch(() => null);
    if (!body) return send(res, 404, 'Not found', 'text/plain');
    send(res, 200, body, TYPES[path.extname(file)] ?? 'application/octet-stream');
  } catch (err) {
    send(res, 500, { ok: false, message: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Story editor:   http://localhost:${PORT}/kit/editor/`);
  console.log(`Game (source):  http://localhost:${PORT}/kit/dev.html`);
  console.log(`Built game:     http://localhost:${PORT}/`);
});
