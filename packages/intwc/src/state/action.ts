import * as monaco from "@pistonite/intwc/monaco";
import {
    type PickerItem,
    showQuickPicker,
    setVsCodeNlsLanguage,
    getVsCodeLoadedNlsLanguages,
    createMenuId,
    registerContextSubmenu,
    contextKeyEquals,
} from "@pistonite/intwc/monaco/extra";
import { getLocale, getLocalizedLanguageName, translate } from "@pistonite/celera";

import { type IStandaloneCodeEditor, setPreference } from "#util";

import { getAllEditors, getEditorState } from "./editor_registry.ts";
import { CTXKEY_LINENUMBER, CTXKEY_LINENUMBER_VISIBLE, CTXKEY_WORDWRAP } from "./constants.ts";

export const initGlobalEditorActions = () => {
    registerContextSubmenu({
        menuId: createMenuId("intwc.line_number_submenu"),
        title: translate("intwc:action.line_number.label"),
        group: "8_intwc_editor",
        whenKey: CTXKEY_LINENUMBER_VISIBLE,
        items: [
            {
                id: "intwc.action.line_number.on",
                title: translate("intwc:generic.on"),
                toggled: contextKeyEquals(CTXKEY_LINENUMBER, "on"),
                run: (editor) => {
                    getEditorState(editor)?.overrideOptions({ lineNumbers: "on" });
                },
            },
            {
                id: "intwc.action.line_number.off",
                title: translate("intwc:generic.off"),
                toggled: contextKeyEquals(CTXKEY_LINENUMBER, "off"),
                run: (editor) => {
                    getEditorState(editor)?.overrideOptions({ lineNumbers: "off" });
                },
            },
            {
                id: "intwc.action.line_number.relative",
                title: translate("intwc:action.line_number.item.relative"),
                toggled: contextKeyEquals(CTXKEY_LINENUMBER, "relative"),
                run: (editor) => {
                    getEditorState(editor)?.overrideOptions({ lineNumbers: "relative" });
                },
            },
        ],
    });
    registerContextSubmenu({
        menuId: createMenuId("intwc.word_wrap_submenu"),
        title: translate("intwc:action.word_wrap.label"),
        group: "8_intwc_editor",
        items: [
            {
                id: "intwc.action.word_wrap.on",
                title: translate("intwc:generic.on"),
                toggled: contextKeyEquals(CTXKEY_WORDWRAP, true),
                run: (editor) => getEditorState(editor)?.overrideOptions({ wordWrap: "on" }),
            },
            {
                id: "intwc.action.word_wrap.off",
                title: translate("intwc:generic.off"),
                toggled: contextKeyEquals(CTXKEY_WORDWRAP, false),
                run: (editor) => getEditorState(editor)?.overrideOptions({ wordWrap: "off" }),
            },
        ],
    });
    monaco.editor.onDidChangeMarkers((uris) => {
        const uriStrings = uris.map((u) => u.toString());
        for (const state of getAllEditors()) {
            state.internalOnNotifiedMarkerChanged(uriStrings);
        }
    });
};

export const addEditorActions = (editor: IStandaloneCodeEditor): void => {
    addLanguagePickerAction(editor);
};

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
                {
                    label: translate("intwc:action.lang_picker.item.note"),
                    pickable: false,
                    payload: "",
                },
            ];
            for (const l of SUPPORTED_LANGUAGES) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const picked = l === (globalThis as any)._VSCODE_NLS_LANGUAGE;
                items.push({ label: getLocalizedLanguageName(l), payload: l, picked });
            }
            if (!SUPPORTED_LANGUAGES.includes("en")) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const picked = !(globalThis as any)._VSCODE_NLS_LANGUAGE;
                items.push({ label: getLocalizedLanguageName("en"), payload: "en", picked });
            }
            items.push({ label: translate("intwc:action.lang_picker.item.synced"), payload: "" });
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
        },
    });
};
