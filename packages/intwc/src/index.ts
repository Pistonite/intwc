//
// FUTURE:
// vim mode
// emacs mode

export {
    type CommonEditorProps,
    type FileEditorProps,
    FileEditor,
    Codicon,
    type SimpleEditorProps,
    SimpleEditor,
    type StatusItem,
    type CustomStatusItem,
    StatusItemPreset,
} from "#components";

export {
    type DiagnosticProvider,
    type DiagnosticTask,
    type DiagnosticMergeResult,
    type LanguageClient,
    convertSemanticTokens,
    type SemanticConverterOptions,
    type SemanticTokensProvider,
} from "#language";

export {
    EditorEventType,
    type EditorEventFn,
    type FileEditorEvent,
    type MultiFileEditorEvent,
} from "#state";

export { type ThemeOptions, type CustomTokenColor } from "#theme";

export * from "./util/monaco_types.ts";
export * from "./util/convert.ts";
export {
    type PreferenceOption,
    type Preference,
    addPreferenceSubscriber,
    getPreference,
    setPreference,
} from "./util/preference.ts";

export { log as intwcLogger } from "#log";

export * from "./init_options.ts";
export * from "./init.ts";
