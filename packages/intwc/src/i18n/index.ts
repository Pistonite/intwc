import { addLocaleSubscriber, convertToSupportedLocaleIn, registerTranslationLoader } from "@pistonite/celera";
import { setVsCodeNlsLanguage }from "@pistonite/intwc/monaco/extra";

import { addPreferenceSubscriber } from "#util";

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
}

const loadIntwcTranslation = async (language: string) :Promise<Record<string, string>> => {
    const l = convertToSupportedLocaleIn(language,[
        "de", "en", "es", "fr", "it", "ja", "ko", "ru", "zh-cn","zh-tw" 
    ]);
    return (await import(`./strings/${l}.yaml`)).default;
}
