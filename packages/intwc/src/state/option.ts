import type * as monaco from "@pistonite/intwc/monaco";

import type { CombinedEditorOptions } from "#util";

export class LayeredOptions {
    private overridenOptions: CombinedEditorOptions | undefined;
    private resolvedOptions: CombinedEditorOptions = {};

    public constructor(private fromPropsOptions: CombinedEditorOptions | undefined) {
        this.resolve();
    }

    public overrideOptions(options: CombinedEditorOptions | undefined): CombinedEditorOptions {
        this.overridenOptions = {
            ...this.overridenOptions,
            ...options,
        };
        return this.resolve();
    }

    public updateFromPropsOptions(
        options: CombinedEditorOptions | undefined,
    ): CombinedEditorOptions {
        if (this.fromPropsOptions === options) {
            return this.resolvedOptions;
        }
        this.fromPropsOptions = options;
        return this.resolve();
    }

    public get(): CombinedEditorOptions {
        return this.resolvedOptions;
    }

    private resolve(): CombinedEditorOptions {
        this.resolvedOptions = {
            ...DEFAULT_EDITOR_OPTIONS,
            ...this.fromPropsOptions,
            ...this.overridenOptions,
        };
        return this.resolvedOptions;
    }
}

const DEFAULT_EDITOR_OPTIONS: CombinedEditorOptions = {
    tabSize: 2,
    "semanticHighlighting.enabled": true,
    bracketPairColorization: {
        enabled: false,
        independentColorPoolPerBracketType: false,
    },
    automaticLayout: true,
};

export const resolveSimpleEditorOptions = (
    editorOptions: CombinedEditorOptions = {},
): CombinedEditorOptions => {
    return {
        minimap: {
            enabled: false,
        },
        lineNumbers: "off",
        ...editorOptions,
    };
};

export const createTextModelOptions = (
    editorOptions: CombinedEditorOptions,
): monaco.editor.ITextModelUpdateOptions => {
    return {
        bracketColorizationOptions: editorOptions.bracketPairColorization?.enabled
            ? (editorOptions.bracketPairColorization as monaco.editor.BracketPairColorizationOptions)
            : (DEFAULT_EDITOR_OPTIONS.bracketPairColorization as monaco.editor.BracketPairColorizationOptions),
        indentSize: "tabSize",
        insertSpaces: editorOptions.insertSpaces !== false,
        tabSize: editorOptions.tabSize || 2,
        trimAutoWhitespace: editorOptions.trimAutoWhitespace !== false,
    };
};

export const isWordWrapEnabledInOptions = (options: CombinedEditorOptions): boolean => {
    return options.wordWrap ? options.wordWrap !== "off" : false;
};
