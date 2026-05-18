import type { LanguageClient } from "#language";
import type { ThemeOptions } from "#theme";
import type { PreferenceOption } from "#util";

/** Option to pass in to init */
export interface InitOption {
    /**
     * Preferences for the editor
     */
    preferences?: PreferenceOption;

    /**
     * Language support configurations
     */
    language?: LanguageOption;

    /**
     * Theme options
     */
    theme?: ThemeOptions;
}

export interface LanguageOption {
    /**
     * TypeScript Configuration
     *
     * If this is not specified, TypeScript features will not be enabled.
     * You also need to use the `intwc` vite plugin to load the TypeScript worker.
     */
    typescript?: TSOption;

    /** Custom language support */
    custom?: LanguageClient[];
}

export interface TSOption {
    /**
     * If DOM API should be enabled for type checking
     *
     * Default is true
     */
    dom?: boolean;
    /**
     * Extra libraries to load
     */
    extraLibs?: TSExtraLib[];
}

export interface TSExtraLib {
    /**
     * The library name. This is used to make the file uri.
     * For example, if the name is "foo", the file uri will
     * be "_lib_foo.ts"
     */
    name: string;
    /** The type definition file content */
    content: string;
}
