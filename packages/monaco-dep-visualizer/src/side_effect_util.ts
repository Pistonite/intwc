export type StaticImport = { ss: number; se: number; d: number };

// A module has side effects if it executes top-level code beyond import/export declarations.
export function hasSideEffects(source: string, statics: StaticImport[]): boolean {
    const buf = [...source];
    for (const imp of statics) {
        if (imp.d === -1) for (let k = imp.ss; k < imp.se; k++) buf[k] = " ";
    }
    const s = buf.join("");
    const n = s.length;
    let i = 0, depth = 0;

    const skipString = (q: string) => {
        while (i < n) {
            if (s[i] === "\\") { i += 2; continue; }
            if (s[i] === q) { i++; return; }
            i++;
        }
    };

    const skipStmt = () => {
        while (i < n) {
            const c = s[i];
            if (c === "/" && s[i+1] === "/") { const e = s.indexOf("\n", i); i = e < 0 ? n : e + 1; continue; }
            if (c === "/" && s[i+1] === "*") { const e = s.indexOf("*/", i+2); i = e < 0 ? n : e + 2; continue; }
            if (c === '"' || c === "'") { const q = c; i++; skipString(q); continue; }
            if (c === "`") { i++; skipString("`"); continue; }
            if (c === "{" || c === "(" || c === "[") { depth++; i++; continue; }
            if (c === "}" || c === ")" || c === "]") {
                if (depth === 0) return;
                depth--;
                i++;
                if (depth === 0 && c === "}") return;
                continue;
            }
            if (c === ";" && depth === 0) { i++; return; }
            i++;
        }
    };

    while (i < n) {
        const c = s[i];
        if (c === "/" && s[i+1] === "/") { const e = s.indexOf("\n", i); i = e < 0 ? n : e + 1; continue; }
        if (c === "/" && s[i+1] === "*") { const e = s.indexOf("*/", i+2); i = e < 0 ? n : e + 2; continue; }
        if (c === '"' || c === "'") { const q = c; i++; skipString(q); continue; }
        if (c === "`") { i++; skipString("`"); continue; }
        if (/[ \t\n\r;]/.test(c)) { i++; continue; }
        if (depth === 0) {
            const rest = s.slice(i);
            if (/^(export[\s{*]|const\s|let\s|var\s|function[\s*(]|class[\s{]|async\s+function\s|['"]use strict['"])/.test(rest)) {
                skipStmt();
                continue;
            }
            return true;
        }
        if (c === "{" || c === "(" || c === "[") { depth++; i++; }
        else if (c === "}" || c === ")" || c === "]") { depth--; i++; }
        else i++;
    }
    return false;
}

// Propagate side effects transitively through bare imports (fixed-point iteration).
// A file that bare-imports (`import './foo'`) a module with side effects is itself marked
// as having side effects. Keys must be consistent between both maps.
export function propagateSideEffects(
    sideEffects: Record<string, boolean>,
    bareImports: Record<string, string[]>,
): void {
    let changed = true;
    while (changed) {
        changed = false;
        for (const [file, bares] of Object.entries(bareImports)) {
            if (!sideEffects[file] && bares.some(b => sideEffects[b])) {
                sideEffects[file] = true;
                changed = true;
            }
        }
    }
}
