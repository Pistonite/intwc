import { persist } from "@pistonite/pure/memory";

export interface PreferenceOption {
    /** If the preference should be persisted to and loaded from localStorage */
    persist?: boolean;

    /**
     * Override the default preference
     *
     * These will not be applied to the persisted preference
     */
    defaults?: Partial<Preference>;
}

export interface Preference {
    /**
     * Input mode for the editor, defaults to "code"
     */
    inputMode: InputMode;

    /**
     * Preferred locale/language to use for VS Code messages.
     * Empty to use celera locale
     */
    syncVscodeLocale: boolean;
}

/** Input mode of the editor */
export type InputMode = "code";

const getDefaultPreference = (): Preference => {
    return {
        inputMode: "code",
        syncVscodeLocale: true,
    };
};
const deserializePreference = (value: string): Preference => {
    try {
        return validatePreference(JSON.parse(value));
    } catch {
        return getDefaultPreference();
    }
};

const validatePreference = (obj: unknown): Preference => {
    if (!obj || typeof obj !== "object") {
        return getDefaultPreference();
    }
    const inputMode: InputMode = "code";
    // if ("inputMode" in obj) {
    //     const value = obj.inputMode;
    //     if (value === "vim" || value === "emacs") {
    //         inputMode = value;
    //     }
    // }
    return { ...getDefaultPreference(), inputMode };
};

const preference = persist({
    storage: localStorage,
    initial: getDefaultPreference(),
    key: "Intwc.Preference",
    deserialize: deserializePreference,
});

export const initPreference = (options: PreferenceOption) => {
    const { persist, defaults } = options;
    const value: Preference = { ...getDefaultPreference(), ...defaults };
    if (persist) {
        preference.init(value);
    } else {
        preference.disable();
        preference.set(value);
    }
};

export const addPreferenceSubscriber = (
    subscriber: (preference: Preference) => void,
    notifyImmediately?: boolean,
): (() => void) => {
    return preference.subscribe(subscriber, notifyImmediately);
};

export function getPreference(): Preference {
    return preference.get();
}

export const setPreference = (newPreference: Partial<Preference>) => {
    const newPreferenceMerged = { ...preference.get(), ...newPreference };
    preference.set(newPreferenceMerged);
};

// export function useInputMode(): InputMode {
//     const preference = useSyncExternalStore(addPreferenceSubscriber, getPreference);
//     return preference.inputMode;
// }
