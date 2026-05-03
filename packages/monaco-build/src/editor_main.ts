export * from "#monaco/vs/editor/edcore.main.js";
export { createWebWorker } from '#monaco/vs/common/workers.js';
import { getGlobalMonaco } from '#monaco/vs/editor/internal/initialize.js';
import { vMonacoLoadEnvironment } from "intwc:virtual-monaco-loader";

const { css, html, json, typescript } = vMonacoLoadEnvironment(getGlobalMonaco);
export { css, html, json, typescript };
