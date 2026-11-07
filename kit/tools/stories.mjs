// Where a project's stories live, and what each one builds to. Shared by the server,
// the bundler and the tests.
//
//   game/story.js           the main story  -> index.html (what GitHub Pages serves)
//   game/<name>.story.js    other stories   -> game/<name>.html
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const NAME = /^[a-z0-9][a-z0-9-]{0,40}$/;

// { name, main, file, rel, page, pageRel } for a story name, or null if the name isn't valid.
export function storyFile(root, name) {
  if (name === 'story') {
    return { name, main: true, file: path.join(root, 'game', 'story.js'), rel: 'game/story.js', page: path.join(root, 'index.html'), pageRel: 'index.html' };
  }
  if (!NAME.test(name ?? '')) return null;
  return {
    name, main: false,
    file: path.join(root, 'game', `${name}.story.js`), rel: `game/${name}.story.js`,
    page: path.join(root, 'game', `${name}.html`), pageRel: `game/${name}.html`,
  };
}

export async function storyFiles(root) {
  const files = await readdir(path.join(root, 'game')).catch(() => []);
  const others = files.map((f) => f.match(/^(.+)\.story\.js$/)?.[1]).filter((n) => n && NAME.test(n)).sort();
  return [storyFile(root, 'story'), ...others.map((n) => storyFile(root, n))];
}
