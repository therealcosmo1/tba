# Text adventure kit

A browser text adventure engine with a free-form command parser, and a story editor to build a game with it. No dependencies: you only need [Node.js](https://nodejs.org) (version 20 or later).

## Start

```bash
npm start
```

Then open http://localhost:8767/kit/editor/. The editor writes your game to `game/story.js`, and every **Save** rebuilds `index.html`: the whole game in one file. A project can hold more stories (`game/<name>.story.js`), each built to `game/<name>.html`. Double-click it to play, or put it on any web host.

- **Play** in the editor opens the story as it is in the editor, unsaved edits included (from `kit/dev.html`).
- http://localhost:8767/ is the built `index.html`.
- The editor only runs on your own computer, through `npm start`.

On macOS you can keep the server running all the time (it starts at login):

```bash
npm run service:install
```

`npm run service:status` and `npm run service:uninstall` check on it and remove it.

## What the editor does

The top bar picks the story you're working on (**+ New story**, **Save as…**), and has Find (with Replace all), Undo/Redo, an **Insert…** menu for variable text, **Play** and **Save**.

| Tab | What you make there |
|---|---|
| **Game** | Title, intro, start-screen questions (answers become `{variables}`), where the player starts, the player, a status line, and **Messages**: every built-in reply, including HELP, which you can reword. |
| **Locations** | Places, grouped into areas on a map you can arrange. Descriptions, smells and sounds, background messages, refused directions, what LOOK NORTH shows, things the description mentions (so players can examine them), dark places, and the room's map. Doors, passages, stairs and archways, including locked, one-way and hidden ones. **Play from here** starts the game in that place. |
| **Objects** | Things: fixed, containers, surfaces, openable and lockable, wearable, edible, drinkable, switchable, giving light, present in several places. Senses, and **reactions** to what the player does with them. |
| **Actors** | People, where they stand, what they say when talked to, and menu **conversations** (each reply can need conditions and run effects). |
| **Events** | Things that happen when conditions are met, or only when something triggers them (now, or N turns later). |
| **Verbs** | Your own commands (`pull [thing]`, `pray`, `clean [thing] with [carried]`): a reply, and rules. Objects can react to them too. |
| **Walkthroughs** | Your game's own tests: steps of commands, with text the reply must or mustn't contain and conditions that must hold. Record one by playing (**Add my last playthrough**). They run on Save, in `npm test`, and before Publish. |
| **Flow** | For every variable, what sets it and what checks it; for every event, what triggers it. |

Conditions and effects are menus, and any condition can be turned round with **not**. Any text can vary: `{variable}`, `{if v}…{else}…{/if}` (also `{if not v}`, `{if v >= 3}`), `{either a|b}`, `{cycle a|b}`, `{stopping a|b}`, `{once}…{/once}` and `{again}…{/again}`.

**Play** opens the story as it is in the editor, saved or not, with a debug panel for variables and moving things about.

## Check the game

```bash
npm test
```

This checks every story for broken references (the editor shows the same list under **Problems**), replays every walkthrough, runs the engine's tests, and makes sure the built pages are up to date.

To try a story from the command line, without a browser (handy for playtests by someone who shouldn't see the story file):

```bash
npm run playtest -- <story> 5
```

It replays the commands in `playtest/<story>.txt`, one per line, and shows the last five replies. Add a line and run it again to "type" the next command.

## Publish on GitHub Pages

1. Make the folder a git repository and push it to GitHub:
   ```bash
   git init && git add -A && git commit -m "Game: start the game"
   ```
2. Turn on the commit checks (see below): `npm run setup`.
3. In the repository's **Settings → Pages**, serve from the `main` branch, `/ (root)`.

After that, the editor's **Publish** button saves, runs the tests, commits `game/story.js` and `index.html`, and pushes. The page updates a minute or two later.

## Game commits and kit commits

The project has two parts:

- `game/`: your game (`story.js`), plus the built `index.html`.
- `kit/`: the engine, the editor and the tools.

After `npm run setup`, every commit message has to start with `Game: ` or `Kit: `, and a commit can't change both `game/` and `kit/`. Publish always makes `Game:` commits. It waits while `kit/` has changes that aren't committed, because the built game would include them.

## Layout

- `kit/dev.html`, `kit/styles/`, `kit/ui/`: the game page (rendering only)
- `kit/engine/`: parser, world model, actions, conversations, events, save and undo. It doesn't use the DOM, so it runs in Node too.
  - `step.js` is the entry point: `step(content, state, input) → { state, output }`
  - `story.js` turns the editor's data into the game (`buildGame(story)`)
- `kit/content.js`: loads `game/story.js`
- `kit/editor/`: the story editor
- `kit/tools/`: `serve.mjs` (server and editor API), `build.mjs` (bundles each story's page), `stories.mjs` (where stories live), `playtest.mjs`, `service.mjs`, `package.mjs`, `check-commit.mjs`
- `kit/tests/`: transcript tests (`*.test.txt`) and their runner
- `kit/starter/story.js`: the empty story that new projects start from
