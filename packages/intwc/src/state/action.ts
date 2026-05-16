import { type PickerItem, showQuickPicker, setVsCodeNlsLanguage, getVsCodeLoadedNlsLanguages, createMenuId, registerContextSubmenu, contextKeyEquals } from "@pistonite/intwc/monaco/extra";
import { getLocale, getLocalizedLanguageName, translate } from "@pistonite/celera";

import { type IStandaloneCodeEditor, setPreference } from "#util";

import type { SingleFileEditorState } from "./single_file.ts";

type EditorState = SingleFileEditorState;

// Map from editor instance -> state, used by the global word wrap submenu commands
const editorMap = new WeakMap<IStandaloneCodeEditor, EditorState>();

export const initGlobalEditorActions = () => {
    registerContextSubmenu(
        createMenuId("intwc.word_wrap_submenu"),
        "Word Wrap",
        "8_intwc_editor",
        [
            {
                id: "intwc.action.word_wrap.off",
                title: "Off", // TODO: translate
                toggled: contextKeyEquals("intwc.wordWrap", false),
                run: (editor) => editorMap.get(editor)?.overrideOptions({ wordWrap: "off" }),
            },
            {
                id: "intwc.action.word_wrap.on",
                title: "On", // TODO: translate
                toggled: contextKeyEquals("intwc.wordWrap", true),
                run: (editor) => editorMap.get(editor)?.overrideOptions({ wordWrap: "on" }),
            },
        ],
    );
}

export const addEditorActions = (state: EditorState, editor: IStandaloneCodeEditor): () => void => {
    editorMap.set(editor, state);
    addLanguagePickerAction(editor);

    return () => {
        editorMap.delete(editor);
    };
}

const addLanguagePickerAction = (editor: IStandaloneCodeEditor) => {
    const SUPPORTED_LANGUAGES = getVsCodeLoadedNlsLanguages();
    if (!SUPPORTED_LANGUAGES.length) {
        return;
    }
    editor.addAction({
        id: "intwc.action.lang_picker",
        label: translate("intwc:action.lang_picker.label"),
        contextMenuGroupId: "9_intwc_misc",
        run: async () => {
            const items: PickerItem<string>[] = [
                { label: translate("intwc:action.lang_picker.item.note"), pickable: false, payload: "" },
            ];
            for (const l of SUPPORTED_LANGUAGES) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const picked = l === (globalThis as any)._VSCODE_NLS_LANGUAGE;
                items.push({label: getLocalizedLanguageName(l), payload: l, picked});
            }
            if (!SUPPORTED_LANGUAGES.includes("en")) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const picked = !(globalThis as any)._VSCODE_NLS_LANGUAGE;
                items.push({label: getLocalizedLanguageName('en'), payload: "en", picked});
            }
            items.push(
                { label: translate("intwc:action.lang_picker.item.synced"), payload: "" }
            );
            const picked = await showQuickPicker("select", items);
            if (picked === undefined) {
                return;
            }
            if (!picked) {
                setPreference({ syncVscodeLocale: true });
                await setVsCodeNlsLanguage(getLocale());
            } else if (picked === "en") {
                setPreference({ syncVscodeLocale: false });
                await setVsCodeNlsLanguage(undefined);
            } else {
                setPreference({ syncVscodeLocale: false });
                await setVsCodeNlsLanguage(picked);
            }
        }
    });
}
