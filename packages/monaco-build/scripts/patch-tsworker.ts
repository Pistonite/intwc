/**
 * Patches TS Worker to expose getEncodedSemanticClassifcations
 * according to the POC here:
 * https://github.com/Pistonight/monaco-editor/commit/ac884678bc17c0eafe174a9cab84510f3b68b4ed
 */

import { Patcher } from "./patcher.ts";

const patchTsWorker = (
) => {
    const patcher = new Patcher( "lib/esm/vs/language/typescript/tsWorker.js");
    patcher.skipUntil((line) => line.trim().includes("class TypeScriptWorker {"));
    patcher.skipUntil((line) => line.trim().startsWith("async provideInlayHints("));
    const fileNameIsLibFnName = "fileNameIsLib";

    const patchContent = `
  async getEncodedSemanticClassifications(fileName, start, end) {
    if (${fileNameIsLibFnName}(fileName)) { return undefined };
    const span = { start, length: end - start };
    return this._languageService.getEncodedSemanticClassifications(fileName, span, "2020");
  }
`;

    patcher.pushPatch(patchContent);
    patcher.finish();
};

const patchTypeScriptWorkerInterface = () => {
    const patcher = new Patcher( "lib/esm/vs/editor/editor.main.d.ts");
    patcher.skipUntil((line) => line.trim() === "interface TypeScriptWorker {");
    patcher.skipUntil((line) => line.trim().startsWith("provideInlayHints("));
    patcher.skipOne();
    patcher.pushPatch(
        `getEncodedSemanticClassifications(fileName: string, start: number, end: number): Promise<{spans: number[]}|undefined>;`,
    );
    patcher.finish();
};

patchTsWorker();
patchTypeScriptWorkerInterface();
