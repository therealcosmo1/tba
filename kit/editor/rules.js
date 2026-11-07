// Editor for a list of conditions or effects (see schema.js and engine/story.js).
import { h, textInput, numberInput, select, parseValue } from './dom.js';
import { OPS, NUM_OPS, DOOR_STATES, SWITCH_STATES } from './schema.js';

// ctx supplies choice lists: rooms(), things(), doors(), actors(), events(), places(),
// nodesOf(actorId), varNames(). onChange is called after every edit.
export function ruleEditor({ list, schema, ctx, onChange, addLabel }) {
  const root = h('div', { class: 'rules' });
  const render = () => {
    root.replaceChildren(
      ...list.map((rule, i) => ruleRow(rule, i)),
      select(
        Object.entries(schema).map(([id, s]) => ({ id, label: s.label })),
        '',
        (type) => {
          if (!type) return;
          list.push({ type, ...structuredClone(schema[type].defaults ?? {}) });
          onChange();
          render();
        },
        { blank: addLabel },
      ),
    );
    root.lastElementChild.classList.add('add-rule');
  };

  const ruleRow = (rule, i) => {
    const def = schema[rule.type];
    const set = (key, value, rerender = false) => {
      if (value === undefined || value === '') delete rule[key];
      else rule[key] = value;
      onChange();
      if (rerender) render();
    };
    const fields = (def?.fields ?? []).map(([key, kind]) => control(rule, key, kind, set, ctx));
    const not = schema.negatable ? h('button', {
      type: 'button', class: `not-toggle${rule.not ? ' on' : ''}`, 'aria-pressed': String(!!rule.not),
      title: 'Turn this condition round: true when it is NOT the case',
      onclick: () => set('not', rule.not ? undefined : true, true),
    }, 'not') : null;
    return h('div', { class: `rule${rule.not ? ' negated' : ''}` },
      not,
      h('span', { class: 'rule-type' }, def?.label ?? `Unknown: ${rule.type}`),
      ...fields,
      h('button', {
        type: 'button', class: 'icon', title: 'Remove', 'aria-label': 'Remove',
        onclick: () => { list.splice(i, 1); onChange(); render(); },
      }, '×'));
  };

  render();
  return root;
}

function control(rule, key, kind, set, ctx) {
  const v = rule[key];
  switch (kind) {
    case 'var': return textInput(v, (x) => set(key, x.trim()), { placeholder: 'variable name', list: 'var-names' });
    case 'op': return select(OPS, v ?? 'is', (x) => set(key, x));
    case 'opNum': return select(NUM_OPS, v ?? 'atLeast', (x) => set(key, x));
    case 'value': return textInput(v === undefined ? '' : String(v), (x) => set(key, parseValue(x)), { placeholder: 'true, false, a number or text' });
    case 'number': return numberInput(v, (x) => set(key, x));
    case 'text': return textInput(v, (x) => set(key, x), { placeholder: 'e.g. look' });
    case 'longtext': return textInput(v, (x) => set(key, x), { multiline: true, rows: 2, placeholder: 'text' });
    case 'room': return select(ctx.rooms(), v, (x) => set(key, x), { blank: 'choose a room' });
    case 'thing': return select(ctx.things(), v, (x) => set(key, x), { blank: 'choose a thing' });
    case 'actor': return select(ctx.actors(), v, (x) => set(key, x, true), { blank: 'choose an actor' });
    case 'event': return select(ctx.events(), v, (x) => set(key, x), { blank: 'choose an event' });
    case 'place': return select(ctx.places(), v, (x) => set(key, x));
    case 'node': return select(ctx.nodesOf(rule.actor), v, (x) => set(key, x), { blank: 'choose a line' });
    case 'door': return select(ctx.doors(), v, (x) => set(key, x), { blank: 'choose a door' });
    case 'doorState': return select(DOOR_STATES, v, (x) => set(key, x));
    case 'switch': return select(ctx.switches(), v, (x) => set(key, x), { blank: 'choose a thing' });
    case 'switchState': return select(SWITCH_STATES, v ?? 'on', (x) => set(key, x));
    default: return h('span', {}, `?${kind}`);
  }
}
