// The debug panel: opened by the editor's Play button (?debug=1), never in the built game
// unless that is in the address. Shows and changes the game state directly: variables,
// where the player and things are, door/switch flags, events that have happened, timers.
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== false) n.setAttribute(k, v === true ? '' : v);
  }
  n.append(...kids.flat().filter((k) => k !== null && k !== undefined && k !== false));
  return n;
};

const parse = (text) => {
  const t = text.trim();
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t !== '' && !Number.isNaN(Number(t))) return Number(t);
  return t;
};

// session: the game Session; content: its content; onChange(): redraw the page.
export function debugPanel(session, content, onChange) {
  const panel = el('section', { class: 'panel debug', 'aria-label': 'Debug' });
  const objects = content.objects;
  const label = (id) => `${objects[id]?.title ?? objects[id]?.name ?? id} (${id})`;
  const rooms = Object.keys(objects).filter((id) => objects[id].kind === 'room');
  const things = Object.keys(objects).filter((id) => objects[id].kind !== 'room' && id !== 'player');
  const change = (fn, note) => {
    const st = structuredClone(session.state);
    fn(st);
    session.state = st;
    onChange(note);
  };
  const select = (options, value, onPick) => {
    const s = el('select', { onchange: () => onPick(s.value) }, ...options.map(([v, text]) => el('option', { value: v }, text)));
    s.value = value ?? '';
    return s;
  };

  function draw() {
    const st = session.state;
    const vars = Object.entries(st.vars);
    const newName = el('input', { type: 'text', placeholder: 'new variable', size: 10 });
    const newValue = el('input', { type: 'text', placeholder: 'value', size: 6 });
    const flags = Object.entries(st.flags).flatMap(([id, f]) => Object.entries(f).filter(([, on]) => on).map(([flag]) => `${id}: ${flag}`));
    let thing = things[0];
    const where = select([['', 'nowhere'], ['player', 'the player'], ...rooms.map((r) => [r, label(r)]), ...things.map((t) => [t, label(t)])], st.loc[thing] ?? '', () => {});
    const which = select(things.map((t) => [t, label(t)]), thing, (v) => { thing = v; where.value = st.loc[v] ?? ''; });
    panel.replaceChildren(
      el('h2', {}, 'Debug'),
      el('p', { class: 'debug-row' }, 'Player in ', select(rooms.map((r) => [r, label(r)]), st.loc.player, (r) => change((s) => {
        s.loc.player = r;
        s.near = objects[r].entryNear ?? null;
        if (!s.visited.includes(r)) s.visited.push(r);
        s.convo = null;
      }, `(Debug: moved to ${label(r)}. Type LOOK.)`))),
      el('h3', {}, 'Variables'),
      el('table', {}, ...vars.map(([k, v]) => {
        const input = el('input', { type: 'text', value: JSON.stringify(v), size: 8, onchange: () => change((s) => { s.vars[k] = parse(input.value.replace(/^"|"$/g, '')); }) });
        return el('tr', {}, el('td', {}, k), el('td', {}, input));
      })),
      el('p', { class: 'debug-row' }, newName, newValue, el('button', { type: 'button', onclick: () => {
        if (newName.value.trim()) change((s) => { s.vars[newName.value.trim()] = parse(newValue.value); });
      } }, 'Set')),
      el('h3', {}, 'Move a thing'),
      el('p', { class: 'debug-row' }, which, ' to ', where, el('button', { type: 'button', onclick: () => change((s) => { s.loc[thing] = where.value || null; }, `(Debug: moved ${label(thing)}.)`) }, 'Move')),
      el('h3', {}, 'State'),
      el('p', { class: 'debug-small' }, `Turn ${st.turn}. Flags: ${flags.join(', ') || 'none'}.`),
      el('p', { class: 'debug-small' }, `Events and reactions that have happened: ${Object.keys(st.fired).join(', ') || 'none'}.`),
      el('p', { class: 'debug-small' }, `Waiting: ${(st.timers ?? []).map((t) => `${t.event} in ${t.left}`).join(', ') || 'nothing'}. Following: ${(st.followers ?? []).join(', ') || 'nobody'}.`),
    );
  }
  draw();
  return { panel, draw };
}
