import { type PickerItem, showQuickPicker, setVsCodeNlsLanguage, getVsCodeLoadedNlsLanguages } from "@pistonite/intwc/monaco/extra";
import { getLocale, getLocalizedLanguageName, i18next, translate } from "@pistonite/celera";

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
                { label: translate("intwc:action.lang_picker.item.synced"), payload: "" },
            ];
            for (const l of SUPPORTED_LANGUAGES) {
                items.push({label: getLocalizedLanguageName(l), payload: l});
            }
            const picked = await showQuickPicker(items);
            if (picked === undefined) {
                return;
            }
            if (!picked) {
                setPreference({ syncVscodeLocale: true });
                await setVsCodeNlsLanguage(getLocale());
            } else {
                setPreference({ syncVscodeLocale: false });
                await setVsCodeNlsLanguage(picked);
            }
        }
    });
}
