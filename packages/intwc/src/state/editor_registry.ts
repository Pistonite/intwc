import type { IStandaloneCodeEditor } from "#util";

import type { SingleFileEditorState } from "./single_file.ts";

export type EditorState = SingleFileEditorState;
// Map from editor instance -> state, used by the global word wrap submenu commands
const editorMap = new Map<IStandaloneCodeEditor, EditorState>();

export const getEditorState = (editor: IStandaloneCodeEditor): EditorState | undefined => {
    return editorMap.get(editor);
};

export const registerEditor = (editor: IStandaloneCodeEditor, state: EditorState): (() => void) => {
    editorMap.set(editor, state);
    return () => {
        editorMap.delete(editor);
    };
};

export const getAllEditors = (): MapIterator<EditorState> => {
    return editorMap.values();
};
