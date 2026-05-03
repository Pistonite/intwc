/**
 * Patches TS Worker to expose getEncodedSemanticClassifcations
 * according to the POC here:
 * https://github.com/Pistonight/monaco-editor/commit/ac884678bc17c0eafe174a9cab84510f3b68b4ed
 */

import fs from "node:fs";

let lines: string[] = [];
let currentLine = 0;
let outLines: string[] = [];

const patchFile = (file: string, fn: () => void) => {
    lines = fs.readFileSync(file, "utf-8").split("\n");
    currentLine = 0;
    outLines = [];
    fn();
    skipToEnd();
    fs.writeFileSync(file, outLines.join("\n"));
};
/**
 * skip from currentLine until a line matches a condition
 * update currentLine. Throws if not found.
 *
 * new current line will not be pushed, but skipped lines will
 */
const skipUntil = (matches: (line: string) => boolean) => {
    for (; currentLine < lines.length; currentLine++) {
        if (matches(lines[currentLine])) {
            return;
        }
        outLines.push(lines[currentLine]);
    }
    throw new Error("Not found");
};
const skipOne = () => {
    outLines.push(lines[currentLine]);
    currentLine++;
};
const skipToEnd = () => {
    outLines.push(...lines.slice(currentLine));
    currentLine = lines.length;
};
const addPatch = (content: string) => {
    outLines.push(
        ...content
            .split("\n")
            .filter(Boolean)
            .map((line) => line.trimEnd()),
    );
};

const _addPatchInlineBefore = (content: string, before: string) => {
    const line = lines[currentLine];
    const index = line.indexOf(before);
    if (index === -1) {
        throw new Error("`before` not found in addPatchInlineBefore");
    }
    lines[currentLine] = line.substring(0, index) + content + line.substring(index);
};

const patchTsWorker = () => {
    skipUntil((line) => line.trim().includes("class TypeScriptWorker {"));
    skipUntil((line) => line.trim().startsWith("async provideInlayHints("));
    const fileNameIsLibFnName = "fileNameIsLib";

    const patchContent = `
  async getEncodedSemanticClassifications(fileName, start, end) {
    if (${fileNameIsLibFnName}(fileName)) { return undefined };
    const span = { start, length: end - start };
    return this._languageService.getEncodedSemanticClassifications(fileName, span, "2020");
  }
`;

    addPatch(patchContent);
};

const patchTypeScriptWorkerInterface = () => {
    skipUntil((line) => line.trim() === "interface TypeScriptWorker {");
    skipUntil((line) => line.trim().startsWith("provideInlayHints("));
    skipOne();
    addPatch(
        `getEncodedSemanticClassifications(fileName: string, start: number, end: number): Promise<{spans: number[]}|undefined>;`,
    );
};

patchFile("lib/esm/vs/language/typescript/tsWorker.js", () => patchTsWorker());

patchFile("lib/esm/vs/editor/editor.main.d.ts", patchTypeScriptWorkerInterface);
