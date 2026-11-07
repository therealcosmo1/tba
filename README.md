# yuriful-tba

TODO: a line about the game.

**Play:** https://therealcosmo1.github.io/tba/ (or open `index.html`). A second game, Saltmarrow: https://therealcosmo1.github.io/tba/game/saltmarrow.html

This repository holds two things:

- `game/`: the game. `story.js` is written by the story editor, and `index.html` at the root is the built game that GitHub Pages serves.
- `kit/`: the engine, the story editor and the tools the game is built with. Its README covers how to use them: [kit/README.md](kit/README.md).

```bash
npm start      # then open http://localhost:8767/kit/editor/
npm test
npm run setup  # once per clone: keeps Game: and Kit: commits apart
```

Game updates are `Game:` commits made by the editor's **Publish** button. Changes to the tools are `Kit:` commits. A downloadable copy of the kit (an empty new project, without this game) is published as a GitHub Release for each `kit-v*` tag.

## License

Free for any noncommercial use; selling it or using it commercially needs permission.

- The engine, editor and tools (everything outside `game/`): [PolyForm Noncommercial 1.0.0](LICENSE).
- The games in `game/`: [CC BY-NC 4.0](game/LICENSE). Share and adapt them with credit, but not commercially.
