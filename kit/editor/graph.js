// Draws a conversation as draggable cards (one per line) joined by arrows (one per reply).
// Card positions are stored on each node as `pos` so the layout survives saving.
import { h } from './dom.js';

const NS = 'http://www.w3.org/2000/svg';
const COL = 290;
const ROW = 190;

// Give every node a position: columns by distance from the start, unreachable ones last.
export function layout(conv, force = false) {
  const nodes = conv.nodes;
  const depth = {};
  const queue = [conv.start, conv.again].filter((n) => n && nodes[n]);
  queue.forEach((n) => (depth[n] = 0));
  while (queue.length) {
    const n = queue.shift();
    for (const o of nodes[n].options ?? []) {
      if (o.go && nodes[o.go] && depth[o.go] === undefined) {
        depth[o.go] = depth[n] + 1;
        queue.push(o.go);
      }
    }
  }
  const maxDepth = Math.max(0, ...Object.values(depth));
  const rows = {};
  for (const [id, node] of Object.entries(nodes)) {
    if (node.pos && !force) continue;
    const col = depth[id] ?? maxDepth + 1;
    rows[col] = (rows[col] ?? 0) + 1;
    node.pos = { x: 24 + col * COL, y: 24 + (rows[col] - 1) * ROW };
  }
}

export function drawGraph(wrap, conv, { selected, onSelect, onMoved }) {
  layout(conv);
  const nodes = conv.nodes;
  const canvas = h('div', { class: 'canvas' });
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('edges');
  svg.innerHTML = '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker></defs>';
  canvas.append(svg);

  const cards = {};
  for (const [id, node] of Object.entries(nodes)) {
    const badges = [
      conv.start === id && h('span', { class: 'badge start' }, 'start'),
      conv.again === id && h('span', { class: 'badge again' }, 'rejoin'),
      node.effects?.length > 0 && h('span', { class: 'badge fx', title: 'Does something when reached' }, 'effects'),
    ];
    const options = (node.options ?? []).map((o, i) =>
      h('div', { class: 'opt', 'data-i': i },
        h('span', { class: 'opt-text' }, o.text || '(no text)'),
        h('span', { class: 'opt-meta' },
          o.when?.length ? '? ' : '',
          o.effects?.length ? '⚡ ' : '',
          o.end ? 'ends' : o.go ? `→ ${o.go}` : 'stays')));
    const card = h('div', { class: `card${selected === id ? ' selected' : ''}`, 'data-node': id, tabindex: 0 },
      h('div', { class: 'card-head' }, h('strong', {}, id), ...badges),
      h('div', { class: 'card-say' }, node.say || '(nothing said yet)'),
      options.length ? h('div', { class: 'opts' }, options) : h('div', { class: 'opts empty' }, 'No replies yet'));
    card.style.left = `${node.pos.x}px`;
    card.style.top = `${node.pos.y}px`;
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') onSelect(id); });
    makeDraggable(card, node, () => { drawEdges(); sizeCanvas(); }, onMoved, () => onSelect(id));
    cards[id] = card;
    canvas.append(card);
  }

  wrap.replaceChildren(canvas);

  function sizeCanvas() {
    let w = 600;
    let hgt = 300;
    for (const c of Object.values(cards)) {
      w = Math.max(w, c.offsetLeft + c.offsetWidth + 80);
      hgt = Math.max(hgt, c.offsetTop + c.offsetHeight + 80);
    }
    canvas.style.width = `${w}px`;
    canvas.style.height = `${hgt}px`;
    svg.setAttribute('width', w);
    svg.setAttribute('height', hgt);
  }

  function drawEdges() {
    for (const p of svg.querySelectorAll('path.edge, text.edge-label')) p.remove();
    for (const [id, node] of Object.entries(nodes)) {
      const from = cards[id];
      (node.options ?? []).forEach((o, i) => {
        if (!o.go) return;
        const row = from.querySelector(`.opt[data-i="${i}"]`);
        const x1 = from.offsetLeft + from.offsetWidth;
        const y1 = from.offsetTop + row.offsetTop + row.offsetHeight / 2;
        const to = cards[o.go];
        const path = document.createElementNS(NS, 'path');
        path.classList.add('edge');
        if (!to) {
          path.classList.add('broken');
          path.setAttribute('d', `M${x1},${y1} h40`);
          const label = document.createElementNS(NS, 'text');
          label.classList.add('edge-label');
          label.setAttribute('x', x1 + 44);
          label.setAttribute('y', y1 + 4);
          label.textContent = `missing: ${o.go}`;
          svg.append(path, label);
          return;
        }
        const x2 = to.offsetLeft;
        const y2 = to.offsetTop + 20;
        let d;
        if (to === from) {
          d = `M${x1},${y1} C${x1 + 60},${y1} ${x1 + 60},${from.offsetTop - 30} ${from.offsetLeft + 40},${from.offsetTop - 30} L${from.offsetLeft + 40},${from.offsetTop}`;
        } else if (x2 > x1) {
          const mid = (x1 + x2) / 2;
          d = `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
        } else {
          // Going back to an earlier line: loop around underneath.
          const below = Math.max(from.offsetTop + from.offsetHeight, to.offsetTop + to.offsetHeight) + 40;
          d = `M${x1},${y1} C${x1 + 70},${y1} ${x1 + 70},${below} ${(x1 + x2) / 2},${below} S${x2 - 70},${y2} ${x2},${y2}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('marker-end', 'url(#arrow)');
        svg.append(path);
      });
    }
  }

  sizeCanvas();
  drawEdges();
}

// Drag a card by any part of it; a press without movement counts as a click.
// `scale` is the canvas's current zoom, so the card keeps up with the pointer.
export function makeDraggable(card, node, onDrag, onMoved, onClick, scale = () => 1) {
  card.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origin = { ...node.pos };
    let moved = false;
    card.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const dx = (ev.clientX - startX) / scale();
      const dy = (ev.clientY - startY) / scale();
      if (!moved && Math.hypot(dx, dy) * scale() < 4) return;
      moved = true;
      card.classList.add('dragging');
      node.pos = { x: Math.max(0, Math.round(origin.x + dx)), y: Math.max(0, Math.round(origin.y + dy)) };
      card.style.left = `${node.pos.x}px`;
      card.style.top = `${node.pos.y}px`;
      onDrag();
    };
    const up = () => {
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerup', up);
      card.classList.remove('dragging');
      if (moved) onMoved();
      else onClick();
    };
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', up);
  });
}
