import * as monaco from "@pistonite/intwc/monaco";

import { type CombinedEditorOptions, type Uri, Position,
    type ITextModel, type IStandaloneCodeEditor
} from "#util";

import { createTextModelOptions } from "./option.ts";

export class SingleFileEditorState {
    private instance: IStandaloneCodeEditor;
    private model: ITextModel;
    private isReadonly_: boolean;

    constructor(
        domNode: HTMLDivElement,
        private options: CombinedEditorOptions,
        fileUri: Uri,
        language: string,
    ) {
        this.isReadonly_ = !!options.readOnly;
        this.model = monaco.editor.createModel("", language, fileUri);
        this.instance = monaco.editor.create(domNode, options);
        this.instance.setModel(this.model);
    }

    /**
     * Raw access to the editor instance. This should be considered
     * unstable and only used for debugging/hacking purpose
     */
    public unstableGetMonaco(): IStandaloneCodeEditor {
        return this.instance;
    }

    /** Destroy the editor. The lifetime of the state is tied to the React component. Do not call manually. */
    public dispose() {
        this.instance.setModel(null);
        this.model.dispose();
        this.instance.dispose();
    }

    /** Set the **resolved** options for the editor. Should use the prop on the React component. Do not call manually */
    public setOptions(newOptions: CombinedEditorOptions) {
        if (this.options === newOptions) {
            return;
        }
        this.isReadonly_ = !!(newOptions.readOnly);
        this.options = newOptions;
        this.instance.updateOptions(newOptions);
        this.model.updateOptions(createTextModelOptions(newOptions));
    }

    /**
     * Set the Uri of the file model.
     *
     * Since Uris are immutable, this deletes the model and recreates one
     */
    public setFileUri(fileUri: Uri) {
        const oldPosition = this.instance.getPosition();
        const newModel = monaco.editor.createModel(
            this.model.getValue(),
            this.model.getLanguageId(),
            fileUri
        );
        const oldModel = this.model;
        this.instance.setModel(newModel);
        this.model = newModel;
        if (oldPosition) {
            this.instance.setPosition(oldPosition);
        }
        oldModel.dispose();
    }

    /** Set the language of the file model */
    public setLanguage(language: string) {
        this.model.getLanguageId();
        monaco.editor.setModelLanguage(this.model, language);
    }

    /** Get the content of the file */
    public getContent(): string {
        return this.model.getValue();
    }

    /**
     * Set the content of the file.
     *
     * The second parameter `force` skips all checks, such as comparing if the new content
     * is the same as old and force sets it (if the comparision is expensive,
     * for example) and if the editor is readonly.
     */
    public setContent(newContent: string, force = false) {
        if (!force) {
            if (this.isReadonly_) {
                return;
            }
            if (newContent === this.model.getValue()) {
                return;
            }
        }
        this.model.setValue(newContent);
    }

    /**
     * Get the current position of the primary cursor.
     *
     * Note that both line number and column are 1-based.
     */
    public getCursorPosition(): Position {
        return this.instance.getPosition() || new Position(1,1);
    }

    public setCursorPosition(position: Position) {
        this.instance.setPosition(position);
    }

    /**
     * Get the character offset of the primary cursor. The offset is 0-based.
     * Note that this is not always the byte offset
     */
    public getCursorCharOffset(): number {
        const position = this.instance.getPosition();
        if (!position) {
            return 0;
        }
        return this.model.getOffsetAt(position) || 0;
    }

    /**
     * Set the primary cursor to an offset. The offset is 0-based.
     * Note that this is not always the byte offset
     */
    public setCursorCharOffset(offset: number) {
        const position = this.model.getPositionAt(offset);
        if (!position) {
            return;
        }
        this.instance.setPosition(position);
    }

    public isReadonly(): boolean {
        return this.isReadonly_;
    }

    /**
     * Set the editor to be readonly. The content can only be modified
     * through `setContent()` and passing `true` for `force`
     */
    public setReadonly(ro: boolean) {
        if (this.isReadonly_ !== ro) {
            this.isReadonly_ = ro;
            this.instance.updateOptions({
                readOnly: ro
            });
        }
    }

}
