# monaco-dep-visualizer

Interactive dependency graph visualizer for the Monaco Editor ESM build.

## Architecture

- `src/analyze.ts` — runs with `bun`, reads `lib/esm/**/*.js`, emits `src/dependency.json`
- `src/app.js` — browser-side canvas visualization, loads `dependency.json` at runtime
- `src/index.html` / `src/style.css` — static shell; served by `shwoop` during dev
- `lib/` — copied from `node_modules/monaco-editor` by `task make` (gitignored, do not edit)

## dependency.json schema

Each entry is a condensed SCC group:
```ts
{
  files: string[];       // relative paths under lib/esm/
  deps: number[];        // indices of groups this group imports
  sideEffects: boolean;  // true if any file in the group executes top-level code
}
```

## Workflow

```sh
task make      # install monaco, copy to lib/, run analyze
task analyze   # re-run analysis only (lib/ must already exist)
task dev       # serve src/ with hot reload for UI work
```

## Side-effects detection (analyze.ts)

`hasSideEffects()` blanks out static import ranges (from `es-module-lexer`), then
walks the remaining source with a depth-tracking mini-parser. Any top-level token
that isn't a declaration keyword (`export`, `const`, `let`, `var`, `function`, `class`,
`async function`, `'use strict'`) is treated as an executable side effect.

The heuristic works well for Monaco's compiled TypeScript output. False positives can
occur with unusual top-level patterns (e.g. IIFEs), but these don't appear in Monaco's ESM.

## Visualization (app.js)

- Nodes are colored by file prefix (see `COLOR_MAP`).
- Nodes with side effects have a red (`#f38ba8`) outline.
- Hover tooltip shows: file(s), level, importer/dependency counts, and `side-effects: yes` if applicable.
- Click a node to highlight its transitive importers (orange) and dependencies (green).
- Tabs separate disconnected components; the main component is first.
