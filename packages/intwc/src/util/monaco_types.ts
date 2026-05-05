// re-exported monaco types so downstream doesn't have to
// import like:
// ```
// import * as monaco from "@pistonite/intwc/monaco";
// type XXX = monaco.editor.XXX;
// ```
//
// Should cover most types in public interfaces

export type {
    CancellationToken, editor, languages
} from "@pistonite/intwc/monaco";
export { Uri, Position, Range, MarkerSeverity } from "@pistonite/intwc/monaco";

import type { editor } from "@pistonite/intwc/monaco";
export type ITextModel = editor.ITextModel;
export type IMarkerData = editor.IMarkerData;
export type IEditorOptions = editor.IEditorOptions;
export type IGlobalEditorOptions = editor.IGlobalEditorOptions;
export type CombinedEditorOptions = IEditorOptions & IGlobalEditorOptions;
export type IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

import type { languages } from "@pistonite/intwc/monaco";
export type ProviderResult<T> = languages.ProviderResult<T>;
export type DocumentRangeSemanticTokensProvider = languages.DocumentRangeSemanticTokensProvider;
export type SemanticTokensLegend = languages.SemanticTokensLegend;
export type SemanticTokens = languages.SemanticTokens;
export type CompletionItemProvider = languages.CompletionItemProvider;
export type CompletionItem = languages.CompletionItem;
export type CompletionList = languages.CompletionList;
export type CompletionContext = languages.CompletionContext;
export type IMonarchLanguage = languages.IMonarchLanguage;
export type LanguageConfiguration = languages.LanguageConfiguration;
