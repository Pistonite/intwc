import * as monaco from "@pistonite/intwc/monaco";

import { CombinedEditorOptions } from "#util"

const DEFAULT_EDITOR_OPTIONS = {
    tabSize: 2,
    "semanticHighlighting.enabled": true,
    bracketPairColorization: {
        enabled: false,
        independentColorPoolPerBracketType: false,
    },
    automaticLayout: true,
};

export const resolveEditorOptions = 
(editorOptions: CombinedEditorOptions = {})
: CombinedEditorOptions => {
    return {
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
             DEFAULT_EDITOR_OPTIONS.bracketPairColorization,
        indentSize: "tabSize",
        insertSpaces: editorOptions.insertSpaces !== false,
        tabSize: editorOptions.tabSize || 2,
        trimAutoWhitespace: editorOptions.trimAutoWhitespace !== false,
    };
}
