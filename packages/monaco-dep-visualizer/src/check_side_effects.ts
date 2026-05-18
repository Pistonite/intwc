// Usage: bun check_side_effects.ts <file.js>
// Exits 0 if no side effects, 1 if side effects detected.

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { init, parse } from "es-module-lexer";
import { hasSideEffects, propagateSideEffects } from "./side_effect_util.ts";

const entryArg = process.argv[2];
if (!entryArg) {
    console.error("Usage: bun check_side_effects.ts <file.js>");
    process.exit(2);
}

const entryPath = resolve(entryArg);

await init;

const sideEffects: Record<string, boolean> = {};
const bareImports: Record<string, string[]> = {};

// BFS: discover all reachable .js files via relative static imports
const queue = [entryPath];
const visited = new Set<string>();

while (queue.length > 0) {
    const filePath = queue.shift()!;
    if (visited.has(filePath)) continue;
    visited.add(filePath);

    if (!existsSync(filePath)) {
        console.warn(`[WARN] File not found: ${filePath}`);
        sideEffects[filePath] = false;
        bareImports[filePath] = [];
        continue;
    }

    const source = readFileSync(filePath, "utf-8");
    const fileDir = dirname(filePath);

    let imports: ReturnType<typeof parse>[0];
    try {
        [imports] = parse(source);
    } catch {
        console.warn(`[WARN] Failed to parse: ${filePath}`);
        sideEffects[filePath] = false;
        bareImports[filePath] = [];
        continue;
    }

    sideEffects[filePath] = hasSideEffects(source, imports);

    const fileBareImports: string[] = [];
    for (const imp of imports) {
        if (imp.d === -1 && imp.n?.startsWith(".")) {
            const abs = resolve(fileDir, imp.n);
            queue.push(abs);
            if (source.slice(imp.ss, imp.s).trim() === "import") fileBareImports.push(abs);
        }
    }
    bareImports[filePath] = [...new Set(fileBareImports)];
}

propagateSideEffects(sideEffects, bareImports);

const result = sideEffects[entryPath] ?? false;
console.log(`${entryArg}: ${result ? "has side effects" : "no side effects"}`);
process.exit(result ? 1 : 0);
