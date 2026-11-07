// Overview of all locations: a box per location, a line per way between them.
// Positions are saved in story.layout; new locations are placed by direction from
// the ones they connect to.
import { h } from './dom.js';
import { makeDraggable } from './graph.js';

const NS = 'http://www.w3.org/2000/svg';
const CELL_X = 210;
const CELL_Y = 120;
const STEP = {
  n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0], ne: [1, -1], nw: [-1, -1], se: [1, 1], sw: [-1, 1],
  u: [0.6, -0.6], d: [-0.6, 0.6], in: [0.6, 0.3], out: [-0.6, -0.3],
};
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_KEY = 'yuriful-tba:editor-atlas-zoom';
let zoom = 1;
try { zoom = clampZoom(Number(localStorage.getItem(ZOOM_KEY)) || 1); } catch {}
function clampZoom(z) { return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)); }
const SHORT = { n: 'N', s: 'S', e: 'E', w: 'W', ne: 'NE', nw: 'NW', se: 'SE', sw: 'SW', u: 'up', d: 'down', in: 'in', out: 'out' };

// Every exit as { from, to, dir, via }. `to` is null for a way that leads nowhere yet.
export function waysOut(objects) {
  const out = [];
  for (const [id, o] of Object.entries(objects)) {
    if (o.kind !== 'room') continue;
    for (const [dir, exit] of Object.entries(o.exits ?? {})) {
      const via = typeof exit === 'object' ? exit.door : null;
      if (via && objects[via]?.leadsTo && !objects[via].leadsTo[id]) continue; // far end of a one-way passage
      const to = typeof exit === 'string' ? exit : exit.to ?? (via ? objects[via]?.leadsTo?.[id] : null) ?? null;
      if (to || via) out.push({ from: id, to, dir, via });
    }
  }
  // Ways with no direction: entered by name ("go through the archway").
  for (const [via, o] of Object.entries(objects)) {
    for (const [from, to] of Object.entries(o.leadsTo ?? {})) {
      if (!out.some((w) => w.from === from && w.via === via)) out.push({ from, to, dir: null, via });
    }
  }
  return out;
}

export function autoLayout(objects, layout, start, margin = 20) {
  const rooms = Object.keys(objects).filter((id) => objects[id].kind === 'room');
  const ways = waysOut(objects);
  const taken = new Set(Object.values(layout).map((p) => `${Math.round(p.x / CELL_X)},${Math.round(p.y / CELL_Y)}`));
  const place = (id, gx, gy) => {
    let key = `${Math.round(gx)},${Math.round(gy)}`;
    while (taken.has(key)) {
      gy += 1;
      key = `${Math.round(gx)},${Math.round(gy)}`;
    }
    taken.add(key);
    layout[id] = { x: Math.round(gx) * CELL_X + 20, y: Math.round(gy) * CELL_Y + 20 };
  };
  const queue = rooms.filter((id) => layout[id]);
  if (!queue.length && rooms.length) {
    const first = rooms.includes(start) ? start : rooms[0];
    place(first, 2, 2);
    queue.push(first);
  }
  while (queue.length) {
    const id = queue.shift();
    const g = { x: (layout[id].x - 20) / CELL_X, y: (layout[id].y - 20) / CELL_Y };
    for (const way of ways.filter((x) => x.from === id && x.to && !layout[x.to])) {
      const [dx, dy] = STEP[way.dir] ?? [1, 0];
      place(way.to, g.x + dx, g.y + dy);
      queue.push(way.to);
    }
  }
  let row = 0;
  for (const id of rooms) if (!layout[id]) place(id, 0, row++);
  // Move the whole arrangement to the top-left corner of the canvas.
  const minX = Math.min(...Object.values(layout).map((p) => p.x));
  const minY = Math.min(...Object.values(layout).map((p) => p.y));
  for (const p of Object.values(layout)) {
    p.x -= minX - margin;
    p.y -= minY - margin;
  }
}

export function drawAtlas(wrap, objects, story, { selected, start, onSelect, onMoved }) {
  story.layout ??= {};
  const areaDepth = (aid, n = 0) => (story.areas?.[aid] && n < 50 ? 1 + areaDepth(story.areas[aid].parent, n + 1) : 0);
  const deepest = Math.max(0, ...Object.keys(story.areas ?? {}).map((aid) => areaDepth(aid)));
  // Leave room above and left of the boxes for area outlines (see drawAreas).
  autoLayout(objects, story.layout, start, 20 + (deepest ? 14 + 14 * deepest : 0));
  // The wrap holds a scroller (kept between redraws, so the view doesn't jump) and the
  // zoom buttons; the canvas inside is drawn at full size and scaled.
  let scroller = wrap.querySelector('.atlas-scroll');
  if (!scroller) {
    scroller = h('div', { class: 'atlas-scroll' });
    const level = h('button', { type: 'button', class: 'zoom-level', title: 'Actual size' });
    const tools = h('div', { class: 'atlas-zoom' },
      h('button', { type: 'button', class: 'icon', title: 'Zoom out', 'aria-label': 'Zoom out', onclick: () => zoomAtlas(wrap, zoom / 1.25) }, '−'),
      level,
      h('button', { type: 'button', class: 'icon', title: 'Zoom in', 'aria-label': 'Zoom in', onclick: () => zoomAtlas(wrap, zoom * 1.25) }, '+'),
      h('button', { type: 'button', title: 'Fit every location in view', onclick: () => zoomAtlas(wrap, 'fit') }, 'Fit'));
    level.addEventListener('click', () => zoomAtlas(wrap, 1));
    wrap.replaceChildren(scroller, tools);
    // Pinch on a trackpad, or Ctrl/Cmd + scroll, zooms around the pointer.
    scroller.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = scroller.getBoundingClientRect();
      zoomAtlas(wrap, zoom * Math.exp(-e.deltaY * 0.01), { x: e.clientX - r.left, y: e.clientY - r.top });
    }, { passive: false });
  }
  const canvas = h('div', { class: 'canvas' });
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('edges');
  canvas.append(svg);

  const boxes = {};
  const ways = waysOut(objects);
  for (const [id, o] of Object.entries(objects)) {
    if (o.kind !== 'room') continue;
    const fromEditor = id in (story.locations ?? {});
    const loose = ways.filter((wy) => wy.from === id && !wy.to).length;
    const actors = Object.values(story.actors ?? {}).filter((a) => a.place?.room === id).length;
    const box = h('div', { class: `loc${selected === id ? ' selected' : ''}`, tabindex: 0, 'data-room': id },
      h('strong', {}, o.title ?? o.name),
      h('span', { class: 'loc-meta' },
        fromEditor ? null : h('span', { class: 'badge' }, 'in code'),
        actors ? h('span', { class: 'badge' }, `${actors} actor${actors > 1 ? 's' : ''}`) : null,
        loose ? h('span', { class: 'badge warn' }, `${loose} not connected`) : null));
    const pos = story.layout[id];
    box.style.left = `${pos.x}px`;
    box.style.top = `${pos.y}px`;
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter') onSelect(id); });
    makeDraggable(box, { get pos() { return story.layout[id]; }, set pos(p) { story.layout[id] = p; } },
      () => { drawLines(); size(); }, onMoved, () => onSelect(id), () => zoom);
    boxes[id] = box;
    canvas.append(box);
  }
  // Direction labels go on a layer above the boxes, so a box can never hide one.
  const overlay = document.createElementNS(NS, 'svg');
  overlay.classList.add('edges');
  canvas.append(overlay);
  scroller.replaceChildren(h('div', { class: 'atlas-sizer' }, canvas));

  function centre(box) {
    return { x: box.offsetLeft + box.offsetWidth / 2, y: box.offsetTop + box.offsetHeight / 2 };
  }

  // A dashed outline around each area's locations; outer areas get more room.
  const areas = story.areas ?? {};
  const parentOf = (aid) => (areas[areas[aid]?.parent] ? areas[aid].parent : '');
  const within = (room, aid) => {
    for (let x = areas[story.areaOf?.[room]] ? story.areaOf[room] : '', i = 0; x && i < 50; x = parentOf(x), i++) if (x === aid) return true;
    return false;
  };
  const height = (aid, seen = 0) => 1 + Math.max(0, ...Object.keys(areas).filter((s) => parentOf(s) === aid && seen < 50).map((s) => height(s, seen + 1)));

  function drawAreas() {
    const outlines = Object.keys(areas)
      .map((aid) => ({ aid, members: Object.keys(boxes).filter((r) => within(r, aid)), pad: 8 + 14 * height(aid) }))
      .filter((a) => a.members.length)
      .sort((x, y) => y.pad - x.pad);
    for (const { aid, members, pad } of outlines) {
      const bs = members.map((r) => boxes[r]);
      const x = Math.min(...bs.map((b) => b.offsetLeft)) - pad;
      const y = Math.min(...bs.map((b) => b.offsetTop)) - pad - 6;
      const x2 = Math.max(...bs.map((b) => b.offsetLeft + b.offsetWidth)) + pad;
      const y2 = Math.max(...bs.map((b) => b.offsetTop + b.offsetHeight)) + pad;
      const rect = document.createElementNS(NS, 'rect');
      rect.classList.add('area-outline');
      for (const [k, v] of Object.entries({ x, y, width: x2 - x, height: y2 - y, rx: 10 })) rect.setAttribute(k, v);
      const label = document.createElementNS(NS, 'text');
      label.classList.add('area-label');
      label.setAttribute('x', x + 10);
      label.setAttribute('y', y + 13);
      label.textContent = areas[aid].name || aid;
      svg.append(rect, label);
    }
  }

  // Where the line from `box`'s centre towards `target` crosses the box's edge, pushed
  // `gap` pixels further out, so lines and labels never sit underneath a box.
  function edgePoint(box, target, gap = 0) {
    const c = centre(box);
    const dx = target.x - c.x;
    const dy = target.y - c.y;
    const t = Math.min((box.offsetWidth / 2 + gap) / Math.abs(dx || 1e-9), (box.offsetHeight / 2 + gap) / Math.abs(dy || 1e-9));
    return { x: c.x + dx * t, y: c.y + dy * t };
  }

  function svgEl(tag, cls, attrs, layer = svg) {
    const node = document.createElementNS(NS, tag);
    node.classList.add(cls);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    layer.append(node);
    return node;
  }

  function pill(text, at) {
    const w = text.length * 6.2 + 12;
    svgEl('rect', 'dir-pill', { x: at.x - w / 2, y: at.y - 8, width: w, height: 16, rx: 8 }, overlay);
    svgEl('text', 'dir-label', { x: at.x, y: at.y + 4 }, overlay).textContent = text;
  }
  const pillWidth = (text) => text.length * 6.2 + 12;

  // One line per door or passage between two locations, with a label at each end naming
  // the direction(s) you leave in from that side ("S / out").
  function drawLines() {
    svg.replaceChildren();
    overlay.replaceChildren();
    drawAreas();
    const links = new Map();
    for (const way of ways) {
      if (!way.to || !boxes[way.to] || !boxes[way.from] || way.to === way.from) continue;
      const [r1, r2] = [way.from, way.to].sort();
      const key = `${r1}|${r2}|${way.via ?? ''}`;
      if (!links.has(key)) links.set(key, { r1, r2, dirs: { [r1]: [], [r2]: [] } });
      if (way.dir) links.get(key).dirs[way.from].push(way.dir);
    }
    for (const { r1, r2, dirs } of links.values()) {
      const a = edgePoint(boxes[r1], centre(boxes[r2]), 2);
      const b = edgePoint(boxes[r2], centre(boxes[r1]), 2);
      svgEl('line', 'edge', { x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      for (const p of [a, b]) svgEl('circle', 'edge-end', { cx: p.x, cy: p.y, r: 2.5 });
      const order = Object.keys(SHORT);
      const label = (ds) => ds.sort((x, y) => order.indexOf(x) - order.indexOf(y)).map((d) => SHORT[d] ?? d).join(' / ');
      const t1 = label(dirs[r1]);
      const t2 = label(dirs[r2]);
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      const room = (t1 ? pillWidth(t1) : 0) + (t2 ? pillWidth(t2) : 0) + 24;
      if (len >= room) {
        // Each label just past its own end, clear of the box.
        if (t1) { const d = pillWidth(t1) / 2 + 8; pill(t1, { x: a.x + ux * d, y: a.y + uy * d }); }
        if (t2) { const d = pillWidth(t2) / 2 + 8; pill(t2, { x: b.x - ux * d, y: b.y - uy * d }); }
      } else {
        // Too short for a label at each end: stack them in the middle, each with an arrow
        // pointing the way it goes.
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const [fwd, back] = Math.abs(ux) >= Math.abs(uy) ? (ux > 0 ? ['→', '←'] : ['←', '→']) : (uy > 0 ? ['↓', '↑'] : ['↑', '↓']);
        const both = t1 && t2;
        if (t1) pill(`${t1} ${fwd}`, { x: mid.x, y: mid.y - (both ? 10 : 0) });
        if (t2) pill(`${t2} ${back}`, { x: mid.x, y: mid.y + (both ? 10 : 0) });
      }
    }
  }



  function size() {
    let w = 500;
    let hgt = 220;
    for (const b of Object.values(boxes)) {
      w = Math.max(w, b.offsetLeft + b.offsetWidth + 40);
      hgt = Math.max(hgt, b.offsetTop + b.offsetHeight + 40);
    }
    canvas.style.width = `${w}px`;
    canvas.style.height = `${hgt}px`;
    for (const layer of [svg, overlay]) {
      layer.setAttribute('width', w);
      layer.setAttribute('height', hgt);
    }
    applyZoom(wrap);
  }

  size();
  drawLines();
}

// Scale the drawn atlas to the current zoom: the sizer gives the scroller the scaled
// size to scroll over, and the dotted background grows and shrinks with it.
function applyZoom(wrap) {
  const scroller = wrap.querySelector('.atlas-scroll');
  const canvas = scroller?.querySelector('.canvas');
  if (!canvas) return;
  canvas.style.transform = `scale(${zoom})`;
  const sizer = canvas.parentElement;
  sizer.style.width = `${parseFloat(canvas.style.width) * zoom}px`;
  sizer.style.height = `${parseFloat(canvas.style.height) * zoom}px`;
  scroller.style.backgroundSize = `${22 * zoom}px ${22 * zoom}px`;
  wrap.querySelector('.zoom-level').textContent = `${Math.round(zoom * 100)}%`;
}

// Zoom to `to` (a scale, or 'fit'), keeping the point `at` (in the scroller's visible
// area, the centre by default) over the same spot of the map.
export function zoomAtlas(wrap, to, at) {
  const scroller = wrap.querySelector('.atlas-scroll');
  const canvas = scroller?.querySelector('.canvas');
  if (!canvas) return;
  const w = parseFloat(canvas.style.width);
  const hgt = parseFloat(canvas.style.height);
  const next = clampZoom(to === 'fit' ? Math.min(1, scroller.clientWidth / w, scroller.clientHeight / hgt) : to);
  at ??= { x: scroller.clientWidth / 2, y: scroller.clientHeight / 2 };
  const mapX = (scroller.scrollLeft + at.x) / zoom;
  const mapY = (scroller.scrollTop + at.y) / zoom;
  zoom = next;
  try { localStorage.setItem(ZOOM_KEY, String(zoom)); } catch {}
  applyZoom(wrap);
  scroller.scrollLeft = to === 'fit' ? 0 : mapX * zoom - at.x;
  scroller.scrollTop = to === 'fit' ? 0 : mapY * zoom - at.y;
}
