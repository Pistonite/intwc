import { addLocaleSubscriber, convertToSupportedLocaleIn, registerTranslationLoader } from "@pistonite/celera";
import { setVsCodeNlsLanguage }from "@pistonite/intwc/monaco/extra";

import { getPreference } from "#util";


export const initI18n = async () => {
    await registerTranslationLoader("intwc", loadIntwcTranslation);
    const preference = getPreference();
    if (preference.syncVscodeLocale) {
        // connect to celera locale
        addLocaleSubscriber((locale) => {
            void setVsCodeNlsLanguage(locale)
        });
    }
}

const loadIntwcTranslation = async (language: string) :Promise<Record<string, string>> => {
    const l = convertToSupportedLocaleIn(language,[
        "de", "en", "es", "fr", "it", "ja", "ko", "ru", "zh-cn","zh-tw" 
    ]);
    return (await import(`./strings/${l}.yaml`)).default;
}
