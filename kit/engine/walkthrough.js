// Walkthroughs: a game's own tests, written in the editor (story.walkthroughs) and
// replayed by the editor and by npm test, so a story change that breaks a path the
// author has already built is caught before it's published.
//
//   walkthroughs: {
//     id: {
//       name: 'Getting in',
//       from: 'otherId',                 // optional: replay that walkthrough first
//       answers: { pname: 'Ada' },       // start-screen answers (missing ones get "Test")
//       steps: [
//         { command: 'talk to guards',
//           expect: ['Halt'],            // the reply must contain each of these
//           reject: ['locked'],          // ...and none of these (case-insensitive)
//           check: [conditions] },       // ...and afterwards these must hold (as in events)
//       ],
//     },
//   }
//
// Replays use a fixed random seed, so background messages don't vary between runs.
import { Session } from './session.js';
import { World } from './world.js';
import { check } from './story.js';

// Steps to replay for a walkthrough: those of the walkthroughs it starts from, then its own.
export function walkthroughSteps(walks, id, seen = new Set()) {
  const w = walks?.[id];
  if (!w) throw new Error(`there is no walkthrough "${id}"`);
  if (seen.has(id)) throw new Error(`walkthrough "${id}" starts from itself`);
  seen.add(id);
  const before = w.from ? walkthroughSteps(walks, w.from, seen).map((s) => ({ ...s, inherited: true })) : [];
  return [...before, ...(w.steps ?? []).map((s) => ({ ...s, inherited: false }))];
}

function answersFor(content, walks, id) {
  const chain = [];
  for (let x = id; x && walks[x] && !chain.includes(x); x = walks[x].from) chain.unshift(x);
  const given = Object.assign({}, ...chain.map((x) => walks[x].answers ?? {}));
  return Object.fromEntries((content.questions ?? []).map((q) => [q.var, given[q.var] || 'Test']));
}

const has = (output, text) => output.toLowerCase().includes(String(text).trim().toLowerCase());

// Runs one walkthrough. Returns { ok, error?, start, steps: [{ command, output, failures, inherited }] }.
// Only a walkthrough's own steps are checked; the ones it starts from are just replayed.
export function runWalkthrough(content, id) {
  const walks = content.story?.walkthroughs ?? content.walkthroughs ?? {};
  const result = { ok: true, start: '', steps: [] };
  try {
    const steps = walkthroughSteps(walks, id);
    const session = new Session(content, { seed: 1 });
    result.start = session.begin(answersFor(content, walks, id)).map((o) => o.text).join('\n');
    for (const step of steps) {
      const r = session.send(step.command ?? '');
      const output = r.reset ? '(back to the start screen)' : r.output.map((o) => o.text).join('\n');
      const w = new World(session.content, session.state);
      const failures = step.inherited ? [] : [
        ...(step.expect ?? []).filter((t) => String(t).trim() && !has(output, t)).map((t) => `doesn't say "${t}"`),
        ...(step.reject ?? []).filter((t) => String(t).trim() && has(output, t)).map((t) => `says "${t}"`),
        ...(step.check ?? []).filter((c) => !check(w, [c])).map((c) => `leaves ${describeCondition(c)} untrue`),
      ];
      if (failures.length) result.ok = false;
      result.steps.push({ command: step.command, output, failures, inherited: step.inherited });
      if (r.reset) break;
    }
  } catch (err) {
    result.ok = false;
    result.error = err.message;
  }
  return result;
}

function describeCondition(c) {
  const not = c.not ? 'NOT ' : '';
  if (c.type === 'var') return `${not}"${c.name} ${c.op ?? 'is'} ${JSON.stringify(c.value)}"`;
  const what = c.thing ?? c.item ?? c.room ?? c.actor ?? c.event ?? '';
  return `${not}"${c.type} ${what}${c.state ? ` ${c.state}` : ''}${c.where !== undefined ? ` in ${c.where || 'nowhere'}` : ''}"`;
}

export function runAllWalkthroughs(content) {
  const walks = content.story?.walkthroughs ?? {};
  return Object.keys(walks).map((id) => ({ id, name: walks[id].name || id, ...runWalkthrough(content, id) }));
}
