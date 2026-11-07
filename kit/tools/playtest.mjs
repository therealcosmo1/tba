// Plays a story from a list of commands, without a browser: for blind playtests (a person,
// or an AI agent that must not read the story file) and for quick checks.
//
//   npm run playtest -- [story] [N] [--file path] [--seed n]
//
//   story   'story' (the main one, default) or the <name> of game/<name>.story.js
//   N       show the replies to the last N commands (default 3; 'all' for everything)
//   --file  the commands, one per line (default playtest/<story>.txt; # lines are ignored)
//   --seed  random seed (default 1), so background text is the same every run
//
// Each run replays every command from a fresh game, so to "type" a command, add a line to
// the file and run it again. Start-screen questions are answered "Tester".
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { storyFile } from './stories.mjs';

const kit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(kit);
const args = process.argv.slice(2);
const opt = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args.splice(i, 2)[1] : null; };
const file = opt('--file');
const seed = Number(opt('--seed') ?? 1);
const name = args.find((a) => !/^(\d+|all)$/.test(a)) ?? 'story';
const show = args.find((a) => /^(\d+|all)$/.test(a)) ?? '3';

const target = storyFile(root, name);
if (!target || !existsSync(target.file)) {
  console.error(`No story called "${name}".`);
  process.exit(1);
}
const { buildGame } = await import(pathToFileURL(path.join(kit, 'engine', 'story.js')).href);
const { Session } = await import(pathToFileURL(path.join(kit, 'engine', 'session.js')).href);
const content = buildGame((await import(pathToFileURL(target.file).href)).default);

const commandsFile = file ?? path.join(root, 'playtest', `${name}.txt`);
if (!existsSync(commandsFile)) {
  mkdirSync(path.dirname(commandsFile), { recursive: true });
  writeFileSync(commandsFile, '');
}
const commands = readFileSync(commandsFile, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

const session = new Session(content, { seed });
const answers = Object.fromEntries((content.questions ?? []).map((q) => [q.var, 'Tester']));
const shown = [{ cmd: '(start of game)', text: session.begin(answers).map((o) => o.text).join('\n') }];
for (const c of commands) {
  const r = session.send(c);
  shown.push({ cmd: c, text: r.output.map((o) => (o.choice ? '  ' : '') + o.text).join('\n') });
  if (r.reset) break;
}
for (const { cmd, text } of shown.slice(show === 'all' ? 0 : -Number(show))) console.log(`> ${cmd}\n${text}\n`);
console.log(`(${commands.length} commands in ${path.relative(root, commandsFile)}, turn ${session.state.turn}${session.state.ended ? ', GAME OVER' : ''})`);
