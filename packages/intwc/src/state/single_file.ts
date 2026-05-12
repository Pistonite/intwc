import * as monaco from "@pistonite/intwc/monaco";
import {addVsCodeNlsLanguageSubscriber} from "@pistonite/intwc/monaco/extra";

import { type CombinedEditorOptions, Position,
    type ITextModel, type IStandaloneCodeEditor,
    getFileUri
} from "#util";

import { createTextModelOptions } from "./option.ts";
import { type EditorEventFn, EditorEventMap, EditorEventType, type FileEditorEvent } from "./event.ts";
import { provideMarkers } from "#language";
import { FileModel } from "./model_ref.ts";
import { addEditorActions } from "./action.ts";

export class SingleFileEditorState {
    private instance: IStandaloneCodeEditor;
    private model: FileModel;
    private isReadonly_: boolean;
    private eventMap: EditorEventMap<FileEditorEvent>;
    private editorCleanup: () => void;
    private mainCleanup: () => void;

    constructor(
        private domNode: HTMLDivElement,
        private options: CombinedEditorOptions,
        filename: string,
        language: string,
    ) {
        this.eventMap = new EditorEventMap();
        this.isReadonly_ = !!options.readOnly;
        this.editorCleanup = () => {};
        this.instance = monaco.editor.create(domNode, options);
        this.setupEditor();

        const model = monaco.editor.createModel("", language, getFileUri(filename));
        model.updateOptions(createTextModelOptions(options));
        this.model = new FileModel(filename, model);
        this.model.setCleanupFn(this.setupModel(this.model, this.model.innerModel()));

        this.instance.setModel(model);

        // provide markers initially
        void provideMarkers(filename, this.model, this.getCursorCharOffset());
        // when language change, recreate the editor to pick up (barely any) language changes
        // unfortunately most NLS items are locked in at static time and will only update
        // after refreshing
        const removeNlsSubscriber = addVsCodeNlsLanguageSubscriber(() => {
            this.recreate();
        });
        this.mainCleanup = () => {
            removeNlsSubscriber();
        };
    }

    private recreate() {
        const position = this.instance.getPosition();
        this.editorCleanup();
        this.instance.setModel(null);
        this.instance.dispose();
        this.instance = monaco.editor.create(this.domNode, this.options);
        this.setupEditor();
        this.instance.setModel(this.model.innerModel());
        if (position) {
            this.instance.setPosition(position);
        }
    }
    private setupEditor() {
        addEditorActions(this.instance);
        const cursorListener = this.instance.onDidChangeCursorPosition(() => {
            this.eventMap.dispatch({
                type: EditorEventType.CursorPositionChanged
            });
        });

        this.editorCleanup = () => {
            cursorListener.dispose();
        };
    }

    private setupModel(model: FileModel, innerModel: ITextModel) {
        const contentListener = innerModel.onDidChangeContent(() => {
            void provideMarkers(model.getFilename(), model, this.getCursorCharOffset());
            this.eventMap.dispatch({
                type: EditorEventType.ContentChanged
            });
        });
        return() => {
            contentListener.dispose();
        };
    }

    public subscribe(eventType: EditorEventType, callback: EditorEventFn<FileEditorEvent>): () => void {
        return this.eventMap.subscribe(eventType, callback);
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
        this.mainCleanup();
        this.editorCleanup();
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
        this.model.innerModel().updateOptions(createTextModelOptions(newOptions));
    }

    /**
     * Set the name (path) of the file model.
     *
     * Since Uris are immutable, this deletes the model and recreates one
     */
    public setFilename(filename: string) {
        this.model.recreateModelWithFilename(
            filename,
            this.instance,
            (newModel) => {
                return this.setupModel(this.model, newModel);
            }
        );
    }

    /** Set the language of the file model */
    public setLanguage(language: string) {
        this.model.setLanguage(language);
    }

    /** Get the content of the file */
    public getContent(): string {
        return this.model.getContent();
    }

    /**
     * Set the content of the file.
     *
     * The second parameter `force` skips all checks, such as comparing if the new content
     * is the same as old and force sets it (if the comparision is expensive,
     * for example) and if the editor is readonly.
     *
     * Note that force setting will also reset the cursor position
     */
    public setContent(newContent: string, force = false) {
        this.model.setContent(newContent, force);
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
        return this.model.getCharOffsetAt(position);
    }

    /**
     * Set the primary cursor to an offset. The offset is 0-based.
     * Note that this is not always the byte offset
     */
    public setCursorCharOffset(offset: number) {
        const position = this.model.getPositionFromCharOffset(offset);
        this.instance.setPosition(position);
    }

    public isReadonly(): boolean {
        return this.isReadonly_;
    }
}
