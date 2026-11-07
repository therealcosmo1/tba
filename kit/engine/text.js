export function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// ["a", "b", "c"] -> "a, b and c"
export function listJoin(items, conj = 'and') {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${conj} ${items.at(-1)}`;
}

// Variable text, usable in any game text written in the editor:
//   {name}                       a variable (start-screen answers, setVar ...)
//   {if v}..{else}..{/if}        also {if not v}, {if v = x}, {if v != x}, {if v >= 3} (> < <=)
//   {either a|b|c}               one at random, each time
//   {cycle a|b|c}                the next one each time, round and round
//   {stopping a|b|c}             the next one each time, then the last for good
//   {once}..{/once}              only the first time this text is shown
//   {again}..{/again}            every time but the first
// ctx: { vars, random() -> 0..1, count(id) -> times seen before (and counts this one) }.
// Counters belong to the text and the directive's position in it, and only move when
// that part is actually shown.
export const TEXT_DIRECTIVES = [
  { insert: '{if variable}…{else}…{/if}', about: 'Text that depends on a variable: {if v}, {if not v}, {if v = x}, {if v >= 3}' },
  { insert: '{either a|b|c}', about: 'One of these at random' },
  { insert: '{cycle a|b|c}', about: 'The next one each time, round and round' },
  { insert: '{stopping a|b|c}', about: 'The next one each time, then the last for good' },
  { insert: '{once}…{/once}', about: 'Only the first time this text is shown' },
  { insert: '{again}…{/again}', about: 'Every time except the first' },
];

const BLOCKS = new Set(['if', 'else', '/if', 'once', '/once', 'again', '/again']);

function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function test(arg, vars) {
  const m = arg.match(/^(not\s+)?(\w+)\s*(?:(=|==|!=|>=|<=|>|<)\s*(.*))?$/);
  if (!m) return false;
  const [, not, name, op, raw] = m;
  const v = vars[name];
  let result;
  if (!op) result = v !== undefined && v !== null && v !== '' && v !== false && v !== 0 && v !== '0' && v !== 'false';
  else {
    const want = raw.trim();
    const num = Number(v ?? 0);
    const wantNum = Number(want);
    result = {
      '=': String(v ?? '') === want, '==': String(v ?? '') === want, '!=': String(v ?? '') !== want,
      '>=': num >= wantNum, '<=': num <= wantNum, '>': num > wantNum, '<': num < wantNum,
    }[op];
  }
  return not ? !result : result;
}

export function expandText(s, ctx) {
  if (typeof s !== 'string' || !s.includes('{')) return s;
  const key = hash(s);
  const tokens = s.split(/(\{[^{}]*\})/);
  let i = 0;
  let n = 0;
  const choices = (arg) => arg.split('|');
  // Reads text until one of `stops`; returns { text, stop }. Inactive text is read
  // (to find where blocks end) but has no effects.
  function block(stops, active) {
    let out = '';
    while (i < tokens.length) {
      const t = tokens[i++];
      if (!t.startsWith('{')) { out += t; continue; }
      const inner = t.slice(1, -1).trim();
      const word = inner.split(/\s+/)[0];
      const arg = inner.slice(word.length).trim();
      if (stops.includes(word)) return { text: out, stop: word };
      if (word === 'if') {
        const yes = active && test(arg, ctx.vars);
        const a = block(['else', '/if'], yes);
        const b = a.stop === 'else' ? block(['/if'], active && !yes) : { text: '' };
        out += yes ? a.text : b.text;
      } else if (word === 'once' || word === 'again') {
        const id = `${key}:${n++}`;
        const seen = active ? ctx.count(id) : 0;
        const a = block([`/${word}`], active && (word === 'once' ? seen === 0 : seen > 0));
        if (active && (word === 'once' ? seen === 0 : seen > 0)) out += a.text;
      } else if (word === 'either' || word === 'cycle' || word === 'stopping') {
        const id = `${key}:${n++}`;
        if (!active) continue;
        const c = choices(arg);
        if (word === 'either') out += c[Math.floor(ctx.random() * c.length)] ?? '';
        else {
          const seen = ctx.count(id);
          out += word === 'cycle' ? c[seen % c.length] : c[Math.min(seen, c.length - 1)];
        }
      } else if (BLOCKS.has(word)) {
        out += ''; // a stray {else} or {/if}: drop it
      } else if (/^\w+$/.test(inner) && ctx.vars[inner] !== undefined && ctx.vars[inner] !== null) {
        out += active ? String(ctx.vars[inner]) : '';
      } else {
        out += t;
      }
    }
    return { text: out, stop: null };
  }
  return block([], true).text;
}

// Problems with a text's directives, for the editor: unclosed or stray blocks.
export function textProblems(s) {
  if (typeof s !== 'string' || !s.includes('{')) return [];
  const problems = [];
  const open = [];
  for (const t of s.match(/\{[^{}]*\}/g) ?? []) {
    const word = t.slice(1, -1).trim().split(/\s+/)[0];
    if (word === 'if' || word === 'once' || word === 'again') open.push(word);
    else if (word === 'else') { if (open.at(-1) !== 'if') problems.push('{else} outside an {if}'); }
    else if (word.startsWith('/') && BLOCKS.has(word)) {
      if (open.at(-1) === word.slice(1)) open.pop();
      else problems.push(`${t} without its opening {${word.slice(1)}}`);
    } else if ((word === 'either' || word === 'cycle' || word === 'stopping') && !t.includes('|')) {
      problems.push(`${t} has only one choice (separate them with |)`);
    }
  }
  for (const o of open) problems.push(`{${o}} is never closed with {/${o}}`);
  return problems;
}
