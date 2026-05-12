import { type PickerItem, showQuickPicker, setVsCodeNlsLanguage, getVsCodeLoadedNlsLanguages } from "@pistonite/intwc/monaco/extra";
import { getLocale, getLocalizedLanguageName, translate } from "@pistonite/celera";

import { type IStandaloneCodeEditor, setPreference } from "#util";

export const addEditorActions = (editor: IStandaloneCodeEditor) => {
    addLanguagePickerAction(editor);
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
