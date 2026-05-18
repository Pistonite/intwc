import type { CombinedEditorOptions, IContextKey, IStandaloneCodeEditor } from "#util";
import { getEditorState } from "./editor_registry.ts";

import { isWordWrapEnabledInOptions } from "./option.ts";

const editorPreferenceMap = new Map<string, EditorPreference[]>();
export class ManagedEditorPreference {
    private self_: EditorPreference;
    constructor(
        editor: IStandaloneCodeEditor,
        private id: string,
    ) {
        this.self_ = new EditorPreference(editor);
    }

    public load(currentOptions: CombinedEditorOptions): CombinedEditorOptions | undefined {
        return this.self_.load(currentOptions, this.id);
    }

    /**
     * Register the preference instance with the ID map. If the persistent ID is not given,
     * this instance acts as a standalone instance and will not be registered
     */
    public register() {
        if (!this.id) {
            return;
        }
        const set = editorPreferenceMap.get(this.id);
        if (!set) {
            editorPreferenceMap.set(this.id, [this.self_]);
        } else {
            set.push(this.self_);
        }
    }

    /** Unregister the instance with the ID map */
    public dispose() {
        if (!this.id) {
            return;
        }
        const set = editorPreferenceMap.get(this.id);
        if (!set) {
            return;
        }
        editorPreferenceMap.set(
            this.id,
            set.filter((x) => x !== this.self_),
        );
    }

    /** Rebind the editor instance to the preference instance (used when the editor is recreated) */
    public rebind(editor: IStandaloneCodeEditor) {
        this.self_.rebind(editor);
    }

    /** Update the options for only this instance. Will not persist the settings. */
    public updateSelfOnly(options: CombinedEditorOptions) {
        this.self_.update(options, "");
    }

    /** Update the options for every editor with the same ID, and persist the settings */
    public updateEverywhere(
        payload: CombinedEditorOptions | undefined,
        resolvedOptions: CombinedEditorOptions,
    ) {
        if (!this.id) {
            this.self_.update(resolvedOptions, "");
            return;
        }
        const set = editorPreferenceMap.get(this.id);
        if (!set) {
            return;
        }
        this.self_.update(resolvedOptions, this.id);
        for (const editorPreference of set) {
            if (this.self_ === editorPreference) {
                continue;
            }
            editorPreference.notify(payload);
        }
    }
}

class EditorPreference {
    private wordWrapKey: IContextKey<boolean>;
    private lineNumberVisibleKey: IContextKey<boolean>;
    private lineNumberCheckedKey: IContextKey<string>;
    constructor(private editor: IStandaloneCodeEditor) {
        this.wordWrapKey = editor.createContextKey("intwc.wordWrap", false);
        this.lineNumberVisibleKey = editor.createContextKey("intwc.line_number_submenu", true);
        this.lineNumberCheckedKey = editor.createContextKey("intwc.line_number_menu_checked", "on");
    }
    public rebind(editor: IStandaloneCodeEditor) {
        if (this.editor === editor) {
            return;
        }
        this.editor = editor;
        this.wordWrapKey = editor.createContextKey("intwc.wordWrap", false);
        this.lineNumberVisibleKey = editor.createContextKey("intwc.line_number_submenu", true);
        this.lineNumberCheckedKey = editor.createContextKey("intwc.line_number_menu_checked", "on");
    }
    public notify(payload: CombinedEditorOptions | undefined) {
        getEditorState(this.editor)?.overrideOptions(payload, true);
    }
    public update(options: CombinedEditorOptions, persistId: string) {
        const wordWrapValue = isWordWrapEnabledInOptions(options);
        const lineNumberVisibleValue = typeof options.lineNumbers !== "function";
        const lineNumberCheckedValue =
            typeof options.lineNumbers === "string" ? options.lineNumbers : "on";
        this.wordWrapKey.set(wordWrapValue);
        this.lineNumberVisibleKey.set(lineNumberVisibleValue);
        this.lineNumberCheckedKey.set(lineNumberCheckedValue);
        if (persistId) {
            const current = loadPersistedEditorPreference();
            current[persistId] = {
                wordWrap: wordWrapValue,
                lineNumberChecked: lineNumberCheckedValue,
            };
            savePersistedEditorPreference(current);
        }
    }
    /** Load options from the persistId. Return an option override payload */
    public load(
        options: CombinedEditorOptions,
        persistId: string,
    ): CombinedEditorOptions | undefined {
        if (!persistId) {
            return undefined;
        }
        const current = loadPersistedEditorPreference();
        const setting = current[persistId];
        if (!setting) {
            return undefined;
        }
        const wordWrapValue = setting.wordWrap;
        const lineNumberVisibleValue = typeof options.lineNumbers !== "function";
        const lineNumberCheckedValue =
            typeof options.lineNumbers === "string" ? setting.lineNumberChecked : "on";
        this.wordWrapKey.set(wordWrapValue);
        this.lineNumberVisibleKey.set(lineNumberVisibleValue);
        this.lineNumberCheckedKey.set(lineNumberCheckedValue);
        const out: CombinedEditorOptions = {
            wordWrap: wordWrapValue ? "on" : "off",
        };
        if (typeof options.lineNumbers === "string") {
            out.lineNumbers = lineNumberCheckedValue as CombinedEditorOptions["lineNumbers"];
        }
        return out;
    }
}

interface PersistedEditorPreference {
    wordWrap: boolean;
    lineNumberChecked: string;
}

let loadedPersistedEditorPreference: Record<string, PersistedEditorPreference> | undefined =
    undefined;
const loadPersistedEditorPreference = (): Record<string, PersistedEditorPreference> => {
    if (loadedPersistedEditorPreference) {
        return loadedPersistedEditorPreference;
    }
    try {
        const persisted = localStorage.getItem("Intwc.PerEditorPreference");
        if (!persisted) {
            return {};
        }
        const map: unknown = JSON.parse(persisted);
        if (!map || typeof map !== "object") {
            return {};
        }
        const map2 = map as Record<string, PersistedEditorPreference>;
        for (const key in map) {
            const currentValue = map2[key] as PersistedEditorPreference;
            const value: PersistedEditorPreference = {
                wordWrap: false,
                lineNumberChecked: "on",
            };
            if (!currentValue || typeof currentValue !== "object") {
                map2[key] = value;
                continue;
            }
            if (typeof currentValue.wordWrap === "boolean") {
                value.wordWrap = currentValue.wordWrap;
            }
            if (typeof currentValue.lineNumberChecked === "string") {
                value.lineNumberChecked = currentValue.lineNumberChecked;
            }
            map2[key] = value;
        }
        return map2;
    } catch {
        return {};
    }
};

const savePersistedEditorPreference = (map: Record<string, PersistedEditorPreference>) => {
    loadedPersistedEditorPreference = map;
    try {
        localStorage.setItem("Intwc.PerEditorPreference", JSON.stringify(map));
    } catch {
        // ignore
    }
};
