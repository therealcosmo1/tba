// commit-msg hook (kit/hooks/commit-msg, turned on by npm run setup).
//
// Every commit is either a game update or a kit change, never both:
//   Game: ...   only game/ (plus index.html and other project files)
//   Kit: ...    only kit/, package.json, .github/ (plus index.html and other project files)
// index.html, README.md, .gitignore and the like can go with either.
// Merges, reverts and fixup!/squash! commits are let through.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const msgFile = process.argv[2];
const message = readFileSync(msgFile, 'utf8').split('\n').filter((l) => !l.startsWith('#')).join('\n').trim();
const gitDir = execFileSync('git', ['rev-parse', '--git-dir'], { encoding: 'utf8' }).trim();
if (existsSync(path.join(gitDir, 'MERGE_HEAD')) || /^(Merge|Revert|fixup!|squash!|amend!)/.test(message)) process.exit(0);

const files = execFileSync('git', ['diff', '--cached', '--name-only', '--no-renames'], { encoding: 'utf8' }).split('\n').filter(Boolean);
const isGame = (f) => f.startsWith('game/');
const isKit = (f) => f.startsWith('kit/') || f.startsWith('.github/') || f === 'package.json';
const game = files.filter(isGame);
const kit = files.filter(isKit);

const fail = (text) => {
  console.error(`\nCommit refused: ${text}\n`);
  process.exit(1);
};

if (game.length && kit.length) {
  fail(`it mixes game and kit changes. Commit them separately:
  game: ${game.join(', ')}
  kit:  ${kit.join(', ')}`);
}
const prefix = message.match(/^(Game|Kit): \S/)?.[1];
if (!prefix) fail('start the message with "Game: " (a game update) or "Kit: " (a change to the tools).');
if (prefix === 'Game' && kit.length) fail(`a "Game:" commit can't change the kit (${kit.join(', ')}).`);
if (prefix === 'Kit' && game.length) fail(`a "Kit:" commit can't change the game (${game.join(', ')}).`);
