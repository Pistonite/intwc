import { vGetLoadedVscodeNlsLanguages, vLoadVscodeNls } from "intwc:virtual-monaco-nls-loader";

/** 
 * Set the NLS language - (requires relaunch)
 */
export const setVsCodeNlsLanguage = async (locale: string): Promise<boolean> => {
    const language = convertToLoadedLanguage(locale);
    const messages = language ? await vLoadVscodeNls(language) : undefined;
    if (!messages) {
        console.error("not a loaded VSCode NLS: "+ locale);
        return false;
    }
    try {
        localStorage.setItem("_VSCODE_NLS", JSON.stringify({ language, messages }));
    } catch(e) {
        console.error("failed to set VSCode NLS", e);
        return false;
    }
    return true;
}

// adopted from @pistonite/celera
const convertToLoadedLanguage = (
    locale: string,
): string | undefined => {
    const loadedLanguages = vGetLoadedVscodeNlsLanguages();
    if (loadedLanguages.includes(locale)) {
        return locale;
    }
    const language = locale.split("-", 2)[0];
    const len = loadedLanguages.length;
    for (let i = 0; i < len; i++) {
        if (loadedLanguages[i].startsWith(language)) {
            return loadedLanguages[i];
        }
    }
    return undefined;
};
