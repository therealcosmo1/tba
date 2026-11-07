// The story's flow: for every variable, what sets it and what checks it; and for every
// event, what triggers it. Read from the story data alone (conditions, effects, replies,
// start-screen questions, and {if}/{variable} in any text).

// A readable "where" for a path into the story, e.g. ['objects','lamp','reactions',2] -> "object lamp, reaction 3".
export function where(story, path) {
  const [kind, id, ...rest] = path;
  const nameOf = (coll, key) => story[coll]?.[key]?.name || story[coll]?.[key]?.title || key;
  const base = {
    objects: () => `object ${nameOf('objects', id)}`,
    actors: () => `${nameOf('actors', id)}`,
    events: () => `event ${nameOf('events', id)}`,
    verbs: () => `verb ${nameOf('verbs', id)}`,
    locations: () => `location ${nameOf('locations', id)}`,
    passages: () => `passage ${nameOf('passages', id)}`,
    game: () => 'game settings',
    walkthroughs: () => `walkthrough ${nameOf('walkthroughs', id)}`,
  }[kind]?.() ?? kind;
  const detail = [];
  for (let i = 0; i < rest.length; i++) {
    const k = rest[i];
    if (k === 'reactions') detail.push(`reaction ${rest[i + 1] + 1}`), i++;
    else if (k === 'rules') detail.push(`rule ${rest[i + 1] + 1}`), i++;
    else if (k === 'nodes') detail.push(`line "${rest[i + 1]}"`), i++;
    else if (k === 'options') detail.push(`reply ${rest[i + 1] + 1}`), i++;
    else if (k === 'questions') detail.push('start-screen question'), i++;
    else if (typeof k === 'string' && !['conversation', 'effects', 'when', 'text', 'say'].includes(k) && !/^\d+$/.test(String(k))) detail.push(k);
  }
  return [base, ...detail].join(', ');
}

// { vars: { name: { sets: [where], checks: [where] } }, events: { id: { by: [where] } } }
export function storyFlow(story) {
  const vars = {};
  const v = (name) => (vars[name] ??= { sets: new Set(), checks: new Set() });
  const triggers = {};
  const walk = (x, path) => {
    if (typeof x === 'string') {
      if (path[0] === 'walkthroughs' || path.includes('notes')) return;
      for (const m of x.matchAll(/\{if\s+(?:not\s+)?(\w+)/g)) v(m[1]).checks.add(where(story, path));
      for (const m of x.matchAll(/\{(\w+)\}/g)) if (!['else', 'once', 'again'].includes(m[1])) v(m[1]).checks.add(where(story, path));
      return;
    }
    if (Array.isArray(x)) return x.forEach((y, i) => walk(y, [...path, i]));
    if (!x || typeof x !== 'object') return;
    if (x.type === 'var' && x.name) v(x.name).checks.add(where(story, path));
    if ((x.type === 'setVar' || x.type === 'addVar') && x.name) v(x.name).sets.add(where(story, path));
    if ((x.type === 'fireEvent' || x.type === 'later') && x.event) (triggers[x.event] ??= new Set()).add(where(story, path));
    if (x.set && typeof x.set === 'object') for (const k of Object.keys(x.set)) v(k).sets.add(where(story, path));
    for (const [k, y] of Object.entries(x)) if (k !== 'layout') walk(y, [...path, k]);
  };
  walk(story, []);
  for (const q of story.game?.questions ?? []) if (q.var) v(q.var).sets.add('the start screen');
  // Message placeholders like {thing} aren't variables.
  for (const p of ['thing', 'Thing', 'other', 'Other', 'person', 'Person', 'list', 'place', 'count', 'word', 'verb', 'options', 'prep', 'Prep', 'isAre', 'question']) {
    if (vars[p] && !vars[p].sets.size) delete vars[p];
  }
  const fix = (o) => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, { sets: [...x.sets].sort(), checks: [...x.checks].sort() }]));
  return {
    vars: fix(vars),
    events: Object.fromEntries(Object.keys(story.events ?? {}).map((id) => [id, { by: [...(triggers[id] ?? [])].sort() }])),
  };
}
