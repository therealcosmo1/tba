// Draws the current room's plan from room.map in content. Shapes with an `obj`
// are clickable and call onPick(objectName).
const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent?.append(node);
  return node;
}

// text: the page's wording (the game's messages); defaults for the editor's previews.
export function renderMap(svg, caption, view, onPick, text = {}) {
  svg.replaceChildren();
  const m = view.map;
  if (!m) {
    svg.setAttribute('viewBox', '0 0 100 20');
    caption.textContent = text.noMap ?? 'No map for this room.';
    return;
  }
  svg.setAttribute('viewBox', `0 0 ${m.w} ${m.h + 4}`);
  for (const s of m.shapes) {
    const node = draw(svg, s, view);
    if (!node || !s.obj) continue;
    const name = view.name(s.obj);
    node.classList.add('pick');
    if (s.obj === view.near) node.classList.add('near');
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', name);
    el('title', {}, node).textContent = name;
    node.addEventListener('click', () => onPick(name));
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPick(name);
      }
    });
  }
  if (view.stand) {
    el('circle', { class: 'player-ring', cx: view.stand.x, cy: view.stand.y, r: 3.6 }, svg);
    el('circle', { class: 'player', cx: view.stand.x, cy: view.stand.y, r: 2 }, svg);
  }
  caption.textContent = view.nearName ? (text.by?.(view.nearName) ?? `You are by ${view.nearName}.`) : view.roomName;
}

function draw(svg, s, view) {
  switch (s.type) {
    case 'room':
      return el('rect', { class: 'floor', x: s.x, y: s.y, width: s.w, height: s.h }, svg);
    case 'entrance': {
      // A wide opening in a wall. Older shapes give `w` and sit on a north/south wall.
      const len = s.len ?? s.w;
      const across = !s.side || s.side === 'n' || s.side === 's';
      return el('rect', across
        ? { class: 'gap', x: s.x, y: s.y - 2, width: len, height: 4 }
        : { class: 'gap', x: s.x - 2, y: s.y, width: 4, height: len }, svg);
    }
    case 'door':
    case 'passage': {
      // On a west/east wall the door runs vertically; on a north/south wall, across.
      const across = s.side === 'n' || s.side === 's';
      const cls = s.type === 'passage' ? 'passage' : `door${view.isOpen(s.obj) ? ' open' : ''}`;
      return el('rect', {
        class: cls,
        x: across ? s.x : s.x - 1.4,
        y: across ? s.y - 1.4 : s.y,
        width: across ? s.len : 2.8,
        height: across ? 2.8 : s.len,
        rx: 0.4,
      }, svg);
    }
    case 'stairs':
      return drawStairs(svg, s);
    case 'balcony': {
      // Floor with a wall on one side (`wall`, west by default) and railings on the other three.
      const g = el('g', {}, svg);
      el('rect', { class: 'balcony', x: s.x, y: s.y, width: s.w, height: s.h }, g);
      const c = { nw: [s.x, s.y], ne: [s.x + s.w, s.y], se: [s.x + s.w, s.y + s.h], sw: [s.x, s.y + s.h] };
      // Corners in order round the floor, starting at the far end of the wall.
      const ring = { w: ['nw', 'ne', 'se', 'sw'], n: ['ne', 'se', 'sw', 'nw'], e: ['se', 'sw', 'nw', 'ne'], s: ['sw', 'nw', 'ne', 'se'] }[s.wall ?? 'w'];
      const [wa, wb] = [c[ring[3]], c[ring[0]]];
      el('line', { class: 'wall', x1: wa[0], y1: wa[1], x2: wb[0], y2: wb[1] }, g);
      el('polyline', { class: 'rail', points: ring.map((k) => c[k].join(',')).join(' ') }, g);
      return g;
    }
    case 'far':
      // Somewhere visible but not here, e.g. the balcony across the way.
      return el('rect', { class: 'far', x: s.x, y: s.y, width: s.w, height: s.h }, svg);
    case 'group':
    case 'person': {
      const g = el('g', { class: s.faint ? 'group faint' : 'group' }, svg);
      const dots = s.type === 'person' ? [[0, 0]] : [[-2.2, -1], [1.8, -1.8], [0.4, 1.6], [3.2, 1.2]];
      for (const [dx, dy] of dots) el('circle', { cx: s.x + dx, cy: s.y + dy, r: s.type === 'person' ? 1.8 : 1.5 }, g);
      return g;
    }
    case 'table':
      return s.round
        ? el('ellipse', { class: 'table', cx: s.x + s.w / 2, cy: s.y + s.h / 2, rx: s.w / 2, ry: s.h / 2 }, svg)
        : el('rect', { class: 'table', x: s.x, y: s.y, width: s.w, height: s.h, rx: 0.8 }, svg);
    default:
      return null;
  }
}

// Two flights either side of a central landing, with tread lines.
function drawStairs(svg, s) {
  const g = el('g', {}, svg);
  const flightW = s.w * 0.34;
  const landing = { x: s.x + flightW, y: s.y, w: s.w - flightW * 2, h: s.h * 0.45 };
  el('rect', { class: 'stairs', x: landing.x, y: landing.y, width: landing.w, height: landing.h }, g);
  for (const fx of [s.x, s.x + s.w - flightW]) {
    el('rect', { class: 'stairs', x: fx, y: s.y, width: flightW, height: s.h }, g);
    for (let i = 1; i < 6; i++) {
      const y = s.y + (s.h / 6) * i;
      el('line', { class: 'step', x1: fx, y1: y, x2: fx + flightW, y2: y }, g);
    }
  }
  return g;
}
