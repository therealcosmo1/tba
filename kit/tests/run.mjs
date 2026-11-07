// Transcript tests: node tests/run.mjs [file-filter]
//
// Format of tests/*.test.txt:
//   > command          run a command
//   some text          the output of the last command must contain this (case-insensitive)
//   !some text         ...must NOT contain this
//   ---                start a fresh game
//   # comment
//   @content path      (first line only) use this content module instead of the game's
// Tests of mechanics use a fixture, so they pass whatever game/story.js holds.
// Each file starts a fresh game with a fixed random seed.
import { readdir, readFile } from 'node:fs/promises';
import gameContent from '../content.js';
import { Session } from '../engine/session.js';
import { lint } from './lint.mjs';
import starter from '../starter/story.js';
import { buildGame } from '../engine/story.js';
import { runWalkthrough, runAllWalkthroughs } from '../engine/walkthrough.js';
import walkthroughFixture from './fixtures/walkthroughs.js';
import { storyFiles } from '../tools/stories.mjs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = new URL('.', import.meta.url);
const filter = process.argv[2] ?? '';
const files = (await readdir(dir)).filter((f) => f.endsWith('.test.txt') && f.includes(filter)).sort();

// Start-screen answers: the game's questions in order get "Ada", "Testhouse", then
// "Answer3"...; content without questions gets name and house.
const ANSWERS = ['Ada', 'Testhouse'];
const answers = (content) => (content.questions?.length
  ? Object.fromEntries(content.questions.map((q, i) => [q.var, ANSWERS[i] ?? `Answer${i + 1}`]))
  : { name: 'Ada', house: 'Testhouse' });

let passed = 0;
let failed = 0;

const lintContent = (name, content) => {
  const problems = lint(content);
  for (const p of problems) console.log(`LINT  ${name}: ${p}`);
  failed += problems.length;
};
lintContent('game', gameContent);
lintContent('starter story', buildGame(starter)); // what a new project starts from

for (const file of files) {
  const lines = (await readFile(new URL(file, dir), 'utf8')).split('\n');
  let content = gameContent;
  if (lines[0].startsWith('@content ')) {
    content = (await import(new URL(lines[0].slice(9).trim(), dir))).default;
    lintContent(file, content);
    lines[0] = '';
  }
  let session, output, command;
  const fresh = () => {
    session = new Session(content, { seed: 1 });
    output = session.begin(answers(content)).map((o) => o.text).join('\n');
    command = '(start)';
  };
  fresh();
  lines.forEach((line, i) => {
    const text = line.trim();
    if (!text || text.startsWith('#')) return;
    if (text === '---') return fresh();
    if (text.startsWith('>')) {
      command = text.slice(1).trim();
      output = session.send(command).output.map((o) => o.text).join('\n');
      return;
    }
    const negate = text.startsWith('!');
    const want = (negate ? text.slice(1) : text).trim().toLowerCase();
    if (output.toLowerCase().includes(want) !== negate) {
      passed++;
    } else {
      failed++;
      console.log(`FAIL  ${file}:${i + 1}  after "> ${command}"`);
      console.log(`      expected ${negate ? 'NOT ' : ''}"${want}"`);
      console.log(`      got: ${output.replace(/\n/g, '\n           ')}`);
    }
  });
}

// The status line: variables and {if} filled in, nothing else moved.
{
  const c = buildGame({ game: { title: 'T', status: 'N={n}{if n >= 2} HIGH{/if}{once} ONCE{/once}', start: { room: 'r' } }, locations: { r: { title: 'R' } }, actors: {}, events: {} });
  const s = new Session(c, { seed: 1 });
  s.begin({});
  s.state.vars.n = 3;
  const line = s.statusLine();
  if (line === s.statusLine() && line === 'N=3 HIGH ONCE') passed++;
  else { failed++; console.log(`FAIL  status line: got "${line}"`); }
}

// The walkthrough runner itself, against a neutral fixture.
{
  const expect = (id, ok, check) => {
    const r = runWalkthrough(walkthroughFixture, id);
    if (r.ok === ok && (!check || check(r))) return passed++;
    failed++;
    console.log(`FAIL  walkthrough runner: ${id} should ${ok ? 'pass' : 'fail'}`, JSON.stringify(r, null, 2));
  };
  expect('walk1', true);
  expect('walk2', true, (r) => r.steps.length === 4 && r.steps[0].inherited && !r.steps[2].inherited);
  expect('walk3', false, (r) => r.steps[2].failures.length === 3 && /untrue/.test(r.steps[2].failures[2]));
  expect('walk4', false, (r) => /starts from itself/.test(r.error));
}

// Every story's own walkthroughs (written in the editor): a story change that breaks one
// fails here. Other stories (game/<name>.story.js) are checked like the main one.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const stories = [['game', gameContent]];
for (const s of (await storyFiles(project)).filter((x) => !x.main)) {
  const content = buildGame((await import(pathToFileURL(s.file).href)).default);
  lintContent(s.rel, content);
  stories.push([s.rel, content]);
}
for (const [label, content] of stories) for (const r of runAllWalkthroughs(content)) {
  if (r.ok) { passed++; continue; }
  failed++;
  console.log(`FAIL  ${label} walkthrough "${r.name}"${r.error ? `: ${r.error}` : ''}`);
  r.steps.forEach((s, i) => s.failures.forEach((f) => console.log(`      step ${i + 1} "> ${s.command}" ${f}\n      got: ${s.output.replace(/\n/g, '\n           ')}`)));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
