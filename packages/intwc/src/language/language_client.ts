import type {
    CancellationToken,
    CompletionContext,
    CompletionItem,
    ProviderResult,
    LanguageConfiguration,
    IMonarchLanguage,
    Position,
    ITextModel,
    CompletionList,
} from "#util";

import type { DiagnosticProvider } from "./diagnostic_provider.ts";
import type { SemanticTokensProvider } from "./semantic_tokens.ts";

export interface LanguageClient {
    /** Get the language id */
    getId: () => string;
    getExtensions?: () => string[];
    /** Get the tokenizer to register on initialization */
    getTokenizer?: () => IMonarchLanguage;
    /** Get the configuration to register on initialization */
    getConfiguration?: () => LanguageConfiguration;

    /** Get diagnostic providers for this language */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getDiagnosticProviders?: () => DiagnosticProvider<any, any>[];

    /** Get the semantic token provider for this language */
    getSemanticTokensProvider?: () => SemanticTokensProvider;

    getCompletionTriggerCharacters?: () => string[];

    provideCompletionItems?: (
        model: ITextModel,
        position: Position,
        context: CompletionContext,
        token: CancellationToken,
    ) => ProviderResult<CompletionList>;

    resolveCompletionItem?: (item: CompletionItem, token: CancellationToken) => CompletionItem;
}
