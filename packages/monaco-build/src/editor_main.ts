import "./patch.css";
export * from "#monaco/vs/editor/edcore.main.js";
export { createWebWorker } from '#monaco/vs/common/workers.js';
import { getGlobalMonaco } from '#monaco/vs/editor/internal/initialize.js';
import { vLoadMonacoGlobals } from "intwc:virtual-monaco-global-loader";

const { css, html, json, typescript } = vLoadMonacoGlobals(getGlobalMonaco);
export { css, html, json, typescript };
