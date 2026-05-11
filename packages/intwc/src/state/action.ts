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
                { type: "separator" },
            ];
            for (const l of SUPPORTED_LANGUAGES) {
                items.push({label: getLocalizedLanguageName(l), payload: l});
            }
            if (!SUPPORTED_LANGUAGES.includes("en")) {
                items.push({label: getLocalizedLanguageName('en'), payload: "en"});
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
        }
    });
}
