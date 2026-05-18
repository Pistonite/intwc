import type { Plugin } from "mono-dev/vite";
import {
    wrapChunkFileNames,
    wrapEntryFileNames,
    type RolldownOutputOptions,
} from "mono-dev/rolldown";

export interface IntwcVitePluginOptions {
    /**
     * Languages to load. This corresponds to @pistonite/intwc-monaco/language-XXX
     * exports.
     * This should be one of the directories in "vs/basic-languages"
     *
     * Loading the languages with service worker (TS, json, css, html) would
     * also automatically enable the worker
     */
    languages?: string[];

    /**
     * Translations (UI languages) to load. This corresponds to @pistonite/intwc-monaco/translation-XXX
     * exports.
     *
     * This should be one of the "nls.messages.XXX.js" exports.
     *
     * Note this only applies to VS Code NLS messages. The INTWC UI messages are always loaded
     */
    translations?: string[];
}

export default function plugin(options: IntwcVitePluginOptions): Plugin {
    const RESOLVED = "433fed8c-9304-4d5e-980e-a65eea2987fd";
    const enableTypeScript = options.languages?.includes("typescript");
    return {
        name: "vite-plugin-intwc",
        enforce: "pre",
        config(config) {
            if (config?.build?.lib) {
                throw new Error("INTWC vite-plugin is currently not supported in library mode");
            }
            // Inject INTWC_TYPESCRIPT define to detect if TypeScript is loaded,
            // also removes TS support when TS is not loaded
            if (!config.define) {
                config.define = {};
            }
            config.define["import.meta.env.INTWC_TYPESCRIPT_LOADED"] = enableTypeScript;
            {
                if (!config.build) {
                    config.build = {};
                }
                if (!config.build.rolldownOptions) {
                    config.build.rolldownOptions = {};
                }
                const rolldownOptions = config.build.rolldownOptions;
                const output = rolldownOptions.output;
                if (output && Array.isArray(output)) {
                    for (let i = 0; i < output.length; i++) {
                        output[i] = updateRolldownOutput(output[i]);
                    }
                } else {
                    rolldownOptions.output = updateRolldownOutput(output);
                }
            }
            {
                if (!config.worker) {
                    config.worker = {};
                }
                if (!config.worker.rolldownOptions) {
                    config.worker.rolldownOptions = {};
                }
                const rolldownOptions = config.worker.rolldownOptions;
                const output = rolldownOptions.output;
                if (output && Array.isArray(output)) {
                    for (let i = 0; i < output.length; i++) {
                        output[i] = updateWorkerRolldownOutput(output[i]);
                    }
                } else {
                    rolldownOptions.output = updateWorkerRolldownOutput(output);
                }
            }
            // remove monaco-editor from optimizeDeps, since there are virtual modules
            if (!config.optimizeDeps) {
                config.optimizeDeps = {};
            }
            for (const excludeDep of ["@pistonite/intwc"]) {
                if (config.optimizeDeps.exclude) {
                    if (!config.optimizeDeps.exclude.includes(excludeDep)) {
                        config.optimizeDeps.exclude.push(excludeDep);
                    }
                } else {
                    config.optimizeDeps.exclude = [excludeDep];
                }
            }
        },
        resolveId: {
            filter: {
                id: /^intwc:/,
            },
            handler(id) {
                switch (id) {
                    // As of 0.55.1 (or earlier but I haven't tracked),
                    // the language service contribution registers a createWorker() function
                    // we patch those to use ?worker syntax, so the global environment
                    // is no longer needed
                    // case "intwc:virtual-monaco-env-loader":
                    case "intwc:virtual-monaco-global-loader":
                    case "intwc:virtual-monaco-nls-loader":
                        return id + RESOLVED;
                }
                return undefined;
            },
        },

        load: {
            filter: {
                id: new RegExp(RESOLVED + "$"),
            },
            handler(id) {
                if (!id.endsWith(RESOLVED)) {
                    return null;
                }
                id = id.substring(0, id.length - RESOLVED.length);
                switch (id) {
                    case "intwc:virtual-monaco-global-loader": {
                        return createGlobalMonacoLoader(options.languages || []);
                    }
                    case "intwc:virtual-monaco-nls-loader": {
                        return createNlsLoader(options.translations || []);
                    }
                }
                // return null to load the original file
                return null;
            },
        },
    };
}
const createGlobalMonacoLoader = (languages: string[]): string => {
    const lines: string[] = [];
    // CSS import
    lines.push(`import "@pistonite/intwc/monaco/styles";`);
    // "basic" language tokenizer
    languages.forEach((l) => {
        lines.push(`import "@pistonite/intwc/monaco/language-${l}";`);
    });

    if (languages.includes("typescript")) {
        lines.push(`import * as typescript from "@pistonite/intwc/monaco/language-typescript";`);
    } else {
        lines.push("const typescript = undefined;");
    }
    if (languages.includes("json")) {
        lines.push(`import * as json from "@pistonite/intwc/monaco/language-json";`);
    } else {
        lines.push("const json = undefined;");
    }
    if (languages.includes("css")) {
        lines.push(`import * as css from "@pistonite/intwc/monaco/language-css";`);
    } else {
        lines.push("const css = undefined;");
    }
    if (languages.includes("html")) {
        lines.push(`import * as html from "@pistonite/intwc/monaco/language-html";`);
    } else {
        lines.push("const html = undefined;");
    }

    lines.push(`
export function vLoadMonacoGlobals(getGlobalMonaco) {
const monacoApi = getGlobalMonaco();
monacoApi.languages.css = css;
monacoApi.languages.html = html;
monacoApi.languages.typescript = typescript;
monacoApi.languages.json = json;
return { css, html, typescript, json };
}
`);

    return lines.join("\n");
};

const createNlsLoader = (languages: string[]): string => {
    const lines: string[] = [];
    lines.push(
        `export function vGetLoadedVscodeNlsLanguages() { return ${JSON.stringify(languages)} }`,
    );
    lines.push("export function vLoadVscodeNls(language) { switch(language) { ");

    for (const l of languages) {
        lines.push(
            `case ${JSON.stringify(l)}: return import("@pistonite/intwc/monaco/translation-${l}")`,
        );
    }

    lines.push("default: return Promise.resolve(undefined) } }");

    return lines.join("\n");
};

const updateRolldownOutput = (output: RolldownOutputOptions | undefined): RolldownOutputOptions => {
    if (!output) {
        output = {};
    }
    output.chunkFileNames = wrapChunkFileNames(
        false,
        output.chunkFileNames,
        ({ facadeModuleId, moduleIds }) => {
            if (!facadeModuleId) {
                if (moduleIds.some((x) => x.match(/intwc[/\\]monaco[/\\]dist/))) {
                    return "assets/intwc/main-[hash].js";
                }
                return undefined;
            }
            const monacoMatch = facadeModuleId.match(/intwc[/\\]monaco[/\\]dist[/\\](.*)/);
            if (monacoMatch) {
                const path = monacoMatch[1];
                if (path.match(/^o[/\\]/)) {
                    return "assets/intwc/o/[name]-[hash].js";
                }
                if (path.match(/^translation[/\\]/)) {
                    return "assets/intwc/s/[name]-[hash].js";
                }
                return undefined;
            }
            return undefined;
        },
    );
    return output;
};

const updateWorkerRolldownOutput = (
    output: RolldownOutputOptions | undefined,
): RolldownOutputOptions => {
    if (!output) {
        output = {};
    }
    output.entryFileNames = wrapEntryFileNames(
        false,
        output.entryFileNames,
        ({ facadeModuleId }) => {
            if (!facadeModuleId) {
                return undefined;
            }
            const match = facadeModuleId.match(/intwc[/\\]monaco[/\\]dist[/\\](.*)/);
            if (!match) {
                return undefined;
            }
            const path = match[1];
            if (path.match(/^worker[/\\]/)) {
                return "assets/intwc/w/[name].worker-[hash].js";
            }
            return undefined;
        },
    );
    return output;
};
