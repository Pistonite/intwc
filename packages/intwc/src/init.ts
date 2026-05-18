import * as monaco from "@pistonite/intwc/monaco";
import { once } from "@pistonite/pure/sync";

import { initThemes } from "./theme";
import { registerDiagnosticProvider } from "#language";
import { initPreference } from "#util";
import { initI18n } from "#i18n";
import { initGlobalEditorActions } from "#state";
import { log } from "#log";

import type { InitOption } from "./init_options.ts";
import { initTypeScriptSemanticTokens } from "./patches/typescript_semantic_tokens.ts";

const initCodeEditorInternal = async ({ preferences, language, theme }: InitOption) => {
    initPreference(preferences || {});
    await initI18n();

    const { typescript, custom } = language || {};

    initThemes(theme || {});

    // initialize TypeScript options
    if (typescript) {
        // this also ensures that if typescript is not loaded, then the typescript
        // stuff can be tree-shaken
        if (!import.meta.env.INTWC_TYPESCRIPT_LOADED) {
            log.warn(
                "TypeScript init options are set, but TypeScript is not loaded using intwc plugin!!!",
            );
        } else {
            monaco.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.typescript.ScriptTarget.ESNext,
                lib: typescript.lib,
                noEmit: true,
                strict: true,
                // jsx: "preserve",
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true,
            });

            if (typescript.customLibs) {
                typescript.customLibs.forEach((lib) => {
                    monaco.typescript.typescriptDefaults.addExtraLib(
                        lib.content,
                        `file:///_lib_${lib.name}.ts`,
                    );
                });
            }

            initTypeScriptSemanticTokens({ semanticTokensMaxLength: -1 });
        }
    } else if (import.meta.env.INTWC_TYPESCRIPT_LOADED) {
        log.warn(
            "TypeScript is bundled, but the `language.typescript` key is not set. TypeScript language service will not start",
        );
    }

    if (custom) {
        custom.forEach((client) => {
            const id = client.getId();
            monaco.languages.register({
                id,
                extensions: client.getExtensions?.(),
            });
            const tokenizer = client.getTokenizer?.();
            if (tokenizer) {
                monaco.languages.registerTokensProviderFactory(id, {
                    create: () => tokenizer,
                });
            }
            const configuration = client.getConfiguration?.();
            if (configuration) {
                monaco.languages.setLanguageConfiguration(id, configuration);
            }

            const semanticTokensProvider = client.getSemanticTokensProvider?.();
            if (semanticTokensProvider) {
                const legend = semanticTokensProvider.legend;
                const provideDocumentRangeSemanticTokens =
                    semanticTokensProvider.provideDocumentRangeSemanticTokens.bind(
                        semanticTokensProvider,
                    );
                monaco.languages.registerDocumentRangeSemanticTokensProvider(id, {
                    getLegend: () => legend,
                    provideDocumentRangeSemanticTokens,
                });
            }

            const diagnosticProviders = client.getDiagnosticProviders?.();
            if (diagnosticProviders) {
                diagnosticProviders.forEach((p) => registerDiagnosticProvider(id, p));
            }

            const provideCompletionItems = client.provideCompletionItems?.bind(client);
            if (provideCompletionItems) {
                const completionTriggerCharacters = client.getCompletionTriggerCharacters?.();
                const resolveCompletionItem = client.resolveCompletionItem?.bind(client);
                monaco.languages.registerCompletionItemProvider(id, {
                    triggerCharacters: completionTriggerCharacters,
                    provideCompletionItems,
                    resolveCompletionItem,
                });
            }
        });
    }

    initGlobalEditorActions();
};

/** Initialize INTWC code editor service */
export const initCodeEditor = once({ fn: initCodeEditorInternal });
