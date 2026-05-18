/**
 * Patch webWorkerFactory.js to create editor worker directly inline
 * instead of monacoEnvironment
 */

import { Patcher } from "./patcher.ts";

const main = () => {
    patchEditorWorker();
    patchLanguageWorker("lib/esm/vs/language/css/workerManager.js", "css");
    patchLanguageWorker("lib/esm/vs/language/html/workerManager.js", "html");
    patchLanguageWorker("lib/esm/vs/language/json/workerManager.js", "json");
    patchLanguageWorker("lib/esm/vs/language/typescript/workerManager.js", "typescript");
};

const patchEditorWorker = () => {
    // ensure the label name is editorWorkerService
    const inspector = new Patcher("lib/esm/vs/editor/standalone/browser/standaloneServices.js");
    inspector.skipUntil((line) => line.startsWith("const standaloneEditorWorkerDescriptor = {"));
    inspector.skipUntil((line) => line.trim() === "label: 'editorWorkerService'");

    const patcher = new Patcher("lib/esm/vs/base/browser/webWorkerFactory.js");
    patcher.pushPatch(
        "import IntwcEditorWorker from '@pistonite/intwc/monaco/worker-editor?worker';",
    );
    patcher.skipUntil((line) => line.trimEnd() === "function getWorker(descriptor, id) {");
    patcher.skipOne();
    patcher.pushPatch(`
if (descriptor.label === 'editorWorkerService') {
return new IntwcEditorWorker();
}
throw new Error("unexpected worker descriptor label: "+descriptor.label);
`);
    patcher.commentOutUntil((line) => line.startsWith("}"));
    checkAllPatched(patcher.finish());
};

const patchLanguageWorker = (filePath: string, language: string) => {
    // console.log("patching "+language +" worker");
    const id = `IntwcL${language}Worker`;
    const patcher = new Patcher(filePath);

    patcher.pushPatch(`import ${id} from '@pistonite/intwc/monaco/worker-${language}?worker';`);
    patcher.skipUntil((line) => line.trimEnd() === "class WorkerManager {");
    patcher.skipUntil((line) => line.trimEnd() === "  _getClient() {");
    patcher.skipUntil((line) => line.trim().startsWith("moduleId: "));
    patcher.commentOutOne();
    patcher.skipUntil((line) => line.trim().startsWith("createWorker: "));
    patcher.commentOutOne();
    patcher.pushPatch(`createWorker: () => new ${id}(),`);

    checkAllPatched(patcher.finish());
};

const checkAllPatched = (output: string) => {
    const outputRemoveComments = output
        .split("\n")
        .filter((x) => !x.trimStart().startsWith("//"))
        .join("\n");
    if (outputRemoveComments.includes("new Worker(")) {
        throw new Error("Worker constructor remained in outptu");
    }
};

main();
