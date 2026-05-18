import {
    addLocaleSubscriber,
    convertToSupportedLocaleIn,
    registerTranslationLoader,
} from "@pistonite/celera";
import {
    setVsCodeNlsLanguage,
    addVsCodeNlsLanguageSubscriber,
} from "@pistonite/intwc/monaco/extra";

import { addPreferenceSubscriber } from "#util";
import { getAllEditors } from "#state";

let vscodeNlsSyncCleanup: (() => void) | undefined;

export const initI18n = async () => {
    await registerTranslationLoader("intwc", loadIntwcTranslation);
    addPreferenceSubscriber((preference) => {
        vscodeNlsSyncCleanup?.();
        if (preference.syncVscodeLocale) {
            // connect to celera locale
            vscodeNlsSyncCleanup = addLocaleSubscriber((locale) => {
                // en may not be loaded because it is the default
                void setVsCodeNlsLanguage(locale.startsWith("en") ? undefined : locale);
            }, true);
        }
    }, true);
    // when language change, recreate the editor to pick up (barely any) language changes
    // unfortunately most NLS items are locked in at static time and will only update
    // after refreshing
    addVsCodeNlsLanguageSubscriber(() => {
        // recreate register new editors which will cause infinite iteration,
        // so we must get only current registered editors
        const allEditors = [...getAllEditors()];
        for (const state of allEditors) {
            state.recreate();
        }
    });
};

const loadIntwcTranslation = async (language: string): Promise<Record<string, string>> => {
    const l = convertToSupportedLocaleIn(language, [
        "de",
        "en",
        "es",
        "fr",
        "it",
        "ja",
        "ko",
        "ru",
        "zh-cn",
        "zh-tw",
    ]);
    const strings = (await import(`./strings/${l}.yaml`)).default;
    return strings[l || "en"];
};
