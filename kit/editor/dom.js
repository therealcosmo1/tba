// Tiny DOM helpers for the editor.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  el.append(...children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false));
  return el;
}

let fieldCount = 0;

// A labelled control. `control` is an input/select/textarea element.
export function field(label, control, hint) {
  control.id ||= `f${++fieldCount}`;
  return h('div', { class: 'field' },
    h('label', { for: control.id }, label),
    control,
    hint && h('p', { class: 'hint' }, hint));
}

// plain: not game text (notes, patterns...), so the Insert menu leaves it alone.
export function textInput(value, onInput, { multiline = false, placeholder = '', list, rows = 3, plain = false } = {}) {
  const el = multiline
    ? h('textarea', { rows, placeholder })
    : h('input', { type: 'text', placeholder, list, autocomplete: 'off', spellcheck: 'true' });
  el.value = value ?? '';
  if (plain) el.dataset.plain = '1';
  el.addEventListener('input', () => onInput(el.value));
  return el;
}

export function numberInput(value, onInput) {
  const el = h('input', { type: 'number', step: 'any' });
  el.value = value ?? '';
  el.addEventListener('input', () => onInput(el.value === '' ? undefined : Number(el.value)));
  return el;
}

// options: [{ id, label }]. `blank` adds an empty first choice with that label.
export function select(options, value, onChange, { blank } = {}) {
  const el = h('select', {},
    blank !== undefined && h('option', { value: '' }, blank),
    options.map((o) => h('option', { value: o.id }, o.label)));
  el.value = value ?? '';
  if (value && !options.some((o) => o.id === value)) {
    el.append(h('option', { value }, `${value} (missing)`));
    el.value = value;
  }
  el.addEventListener('change', () => onChange(el.value));
  return el;
}

export function checkbox(label, checked, onChange) {
  const input = h('input', { type: 'checkbox' });
  input.checked = !!checked;
  input.addEventListener('change', () => onChange(input.checked));
  return h('label', { class: 'check' }, input, label);
}

// "group, guests" <-> ["group", "guests"]
export function listInput(values, onInput, placeholder) {
  return textInput((values ?? []).join(', '), (v) => onInput(v.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)), { placeholder });
}

// "true" -> true, "3" -> 3, anything else stays text.
export function parseValue(text) {
  const t = text.trim();
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t !== '' && !Number.isNaN(Number(t))) return Number(t);
  return text;
}
