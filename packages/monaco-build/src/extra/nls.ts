import { vGetLoadedVscodeNlsLanguages, vLoadVscodeNls } from "intwc:virtual-monaco-nls-loader";

export const getVsCodeLoadedNlsLanguages = (): string[] => {
    // using a wrapper instead of re-export to get the right typing
    return vGetLoadedVscodeNlsLanguages();
}

const nlsSubscribers: (() => void)[] = [];
export const addVsCodeNlsLanguageSubscriber = (callback: () => void): () => void => {
    nlsSubscribers.push(callback);
    return () => {
        const i = nlsSubscribers.indexOf(callback);
        if (i >= 0) {
            nlsSubscribers.splice(i, 1);
        }
    };
}
const notifyNlsSubscribers = () => {
    const len = nlsSubscribers.length;
    for (let i = 0; i< len; i++) {
        nlsSubscribers[i]();
    }
    // if subscribers are added in the callback things might go very wrong
}

/** 
 * Set the NLS language.
 *
 * Most messages would require relaunch to update. Some will update after editor is recreated.
 */
export const setVsCodeNlsLanguage = async (locale: string | undefined): Promise<boolean> => {
    if (!locale) {
        localStorage.removeItem("_VSCODE_NLS");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any)._VSCODE_NLS_LANGUAGE = undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any)._VSCODE_NLS_MESSAGES = undefined;
        notifyNlsSubscribers();
        return true;
    }
    const language = convertToLoadedLanguage(locale);
    const data = language ? await vLoadVscodeNls(language) : undefined;
    if (!data) {
        console.error("not a loaded VSCode NLS: "+ locale);
        return false;
    }
    try {
        const loaded = data.default;
        localStorage.setItem("_VSCODE_NLS", JSON.stringify(loaded));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any)._VSCODE_NLS_LANGUAGE = loaded.language;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any)._VSCODE_NLS_MESSAGES = loaded.messages;
    } catch(e) {
        console.error("failed to set VSCode NLS", e);
        localStorage.removeItem("_VSCODE_NLS");
        return false;
    }
    notifyNlsSubscribers();
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
