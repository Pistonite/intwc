import * as monaco from "@pistonite/intwc/monaco";

import type { CombinedEditorOptions, Uri } from "#util";

import { createTextModelOptions } from "./option.ts";

export class SingleFileEditorState {
    private instance: monaco.editor.IStandaloneCodeEditor;
    private model: monaco.editor.ITextModel;

    constructor(
        private domNode: HTMLDivElement,
        private options: CombinedEditorOptions,
        private fileUri: Uri,
        private language: string,
    ) {
    }

    /** Destroy the editor. The lifetime of the state is tied to the React component. Do not call manually. */
    public dispose() {
    }

    /** Set the **resolved** options for the editor. Should use the prop on the React component. Do not call manually */
    public setOptions(newOptions: CombinedEditorOptions) {
        if (this.options === newOptions) {
            return;
        }
        this.options = newOptions;
        this.instance.updateOptions(newOptions);
        this.model.updateOptions(createTextModelOptions(newOptions));
    }

    public setFileUri(fileUri: Uri) {
        // this.model.set
    }

    public setLanguage(language: string) {
        monaco.editor.setModelLanguage(this.model, language);
    }

}
