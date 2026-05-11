import type * as monaco from "@pistonite/intwc/monaco";

import type { CombinedEditorOptions } from "#util"

const DEFAULT_EDITOR_OPTIONS: CombinedEditorOptions = {
    tabSize: 2,
    "semanticHighlighting.enabled": true,
    bracketPairColorization: {
        enabled: false,
        independentColorPoolPerBracketType: false,
    },
    automaticLayout: true,
};

const DEFAULT_SIMPLE_EDITOR_OPTIONS: CombinedEditorOptions = {
    minimap: {
        enabled: false
    },
    lineNumbers: "off",
};
export const resolveSimpleEditorOptions = 
(editorOptions: CombinedEditorOptions = {})
: CombinedEditorOptions => {
    return {
        ...editorOptions,
        minimap: "minimap" in editorOptions ? editorOptions.minimap : DEFAULT_SIMPLE_EDITOR_OPTIONS.minimap,
        lineNumbers: editorOptions.lineNumbers || DEFAULT_SIMPLE_EDITOR_OPTIONS.lineNumbers,
    }
}

export const resolveEditorOptions = 
(editorOptions: CombinedEditorOptions = {})
: CombinedEditorOptions => {
    return {
        ...editorOptions,
        tabSize: "tabSize" in editorOptions ? editorOptions.tabSize : DEFAULT_EDITOR_OPTIONS.tabSize,
        "semanticHighlighting.enabled": "semanticHighlighting.enabled" in editorOptions ? editorOptions["semanticHighlighting.enabled"] : 
            DEFAULT_EDITOR_OPTIONS["semanticHighlighting.enabled"],
        bracketPairColorization: editorOptions.bracketPairColorization?.enabled ? editorOptions.bracketPairColorization : DEFAULT_EDITOR_OPTIONS.bracketPairColorization,
        automaticLayout: editorOptions?.automaticLayout !== false
    }
}

export const createTextModelOptions = (editorOptions: CombinedEditorOptions)
: monaco.editor.ITextModelUpdateOptions => {
    return {
        bracketColorizationOptions: 
        editorOptions.bracketPairColorization?.enabled ?
            editorOptions.bracketPairColorization as monaco.editor.BracketPairColorizationOptions
                :
             DEFAULT_EDITOR_OPTIONS.bracketPairColorization as monaco.editor.BracketPairColorizationOptions,
        indentSize: "tabSize",
        insertSpaces: editorOptions.insertSpaces !== false,
        tabSize: editorOptions.tabSize || 2,
        trimAutoWhitespace: editorOptions.trimAutoWhitespace !== false,
    };
}

export const cycleLineNumberMode = (mode: string): monaco.editor.LineNumbersType => {
    switch (mode) {
        case "on": return "relative";
        case "relative": return "off";
        default: return "on";
    }
}
