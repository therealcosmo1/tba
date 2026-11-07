export function renderInventory(list, items, onPick, text = {}) {
  list.replaceChildren(...(items.length ? items.map((item) => itemNode(item, onPick)) : [emptyNode(text.empty)]));
}

function itemNode(item, onPick) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = item.name;
  button.addEventListener('click', () => onPick(item.name));
  li.append(button);
  for (const text of [item.worn && 'worn', item.on]) {
    if (!text) continue;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = text;
    li.append(tag);
  }
  if (item.contents.length) {
    const ul = document.createElement('ul');
    ul.append(...item.contents.map((c) => itemNode(c, onPick)));
    li.append(ul);
  }
  return li;
}

function emptyNode(text = 'Empty-handed') {
  const li = document.createElement('li');
  li.className = 'empty';
  li.textContent = text;
  return li;
}
