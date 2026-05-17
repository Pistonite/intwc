import * as monaco from "@pistonite/intwc/monaco";
import {addVsCodeNlsLanguageSubscriber} from "@pistonite/intwc/monaco/extra";

import { type CombinedEditorOptions, Position,
    type ITextModel, type IStandaloneCodeEditor,
    getFileUri,
} from "#util";
import { provideMarkers } from "#language";

import { createTextModelOptions, isWordWrapEnabledInOptions, LayeredOptions } from "./option.ts";
import { type EditorEventFn, EditorEventMap, EditorEventType, type FileEditorEvent } from "./event.ts";
import { FileModel, type MarkerStat } from "./model_ref.ts";
import { addEditorActions } from "./action.ts";

export class SingleFileEditorState {
    private instance: IStandaloneCodeEditor;
    private model: FileModel;
    private eventMap: EditorEventMap<FileEditorEvent>;
    private editorCleanup: () => void;
    private mainCleanup: () => void;
    private layeredOptions: LayeredOptions;

    // todo: editor-id specific persistant settings
    private wordWrapKey: monaco.editor.IContextKey<boolean> | undefined;
    private lineNumberVisibleKey: monaco.editor.IContextKey<boolean> | undefined;
    private lineNumberCheckedKey: monaco.editor.IContextKey<string> | undefined;

    constructor(
        private domNode: HTMLDivElement,
        fromPropsOptions: CombinedEditorOptions | undefined,
        filename: string,
        language: string,
    ) {
        this.layeredOptions = new LayeredOptions(fromPropsOptions);
        const resolvedOptions = this.layeredOptions.get();
        this.eventMap = new EditorEventMap();
        this.editorCleanup = () => {};
        this.instance = monaco.editor.create(domNode, resolvedOptions);
        this.setupEditor();

        const model = monaco.editor.createModel("", language, getFileUri(filename));
        model.updateOptions(createTextModelOptions(resolvedOptions));
        this.model = new FileModel(filename, model);
        this.model.setCleanupFn(this.setupModel(this.model, this.model.innerModel()));

        this.instance.setModel(model);

        // provide markers initially
        this.updateMarkers(this.model);
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
        this.instance = monaco.editor.create(this.domNode, this.getOptions());
        this.setupEditor();
        this.instance.setModel(this.model.innerModel());
        if (position) {
            this.instance.setPosition(position);
        }
        // re-provider markers using the new locale
        this.updateMarkers(this.model);
    }
    private setupEditor() {
        const actionCleanup = addEditorActions(this, this.instance);

        const options = this.getOptions();
        this.wordWrapKey = this.instance.createContextKey("intwc.wordWrap", false);
        this.lineNumberVisibleKey = this.instance.createContextKey("intwc.line_number_submenu", true);
        this.lineNumberCheckedKey = this.instance.createContextKey("intwc.line_number_menu_checked", "on");
        this.updateContextKeys(options);

        const cursorListener = this.instance.onDidChangeCursorPosition(() => {
            this.eventMap.dispatch({
                type: EditorEventType.CursorPositionChanged
            });
        });

        this.editorCleanup = () => {
            actionCleanup();
            cursorListener.dispose();
            this.wordWrapKey = undefined;
            this.lineNumberVisibleKey = undefined;
            this.lineNumberCheckedKey = undefined;
        };
    }

    private setupModel(model: FileModel, innerModel: ITextModel) {
        const contentListener = innerModel.onDidChangeContent(() => {
            this.updateMarkers(model);
            this.eventMap.dispatch({
                type: EditorEventType.ContentChanged
            });
        });
        return() => {
            contentListener.dispose();
        };
    }

    private updateMarkers(model: FileModel) {
        provideMarkers(model.getFilename(), model, this.getCursorCharOffset());
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

    public updateFromPropsOptions(newOptions: CombinedEditorOptions | undefined) {
        const oldOptions = this.getOptions();
        const newResolvedOptions = this.layeredOptions.updateFromPropsOptions(newOptions);
        if (oldOptions === newResolvedOptions) {
            return;
        }
        this.instance.updateOptions(newResolvedOptions);
        this.model.innerModel().updateOptions(createTextModelOptions(newResolvedOptions));
        this.updateContextKeys(newResolvedOptions);
        this.eventMap.dispatch({type: EditorEventType.OptionChanged});
    }

    public overrideOptions(newOptions: CombinedEditorOptions | undefined) {
        const newResolvedOptions = this.layeredOptions.overrideOptions(newOptions);
        this.instance.updateOptions(newResolvedOptions);
        this.model.innerModel().updateOptions(createTextModelOptions(newResolvedOptions));
        this.updateContextKeys(newResolvedOptions);
        this.eventMap.dispatch({type: EditorEventType.OptionChanged});
    }

    private updateContextKeys(options: CombinedEditorOptions) {
        this.wordWrapKey?.set(isWordWrapEnabledInOptions(options));
        this.lineNumberVisibleKey?.set(typeof options.lineNumbers !== "function");
        this.lineNumberCheckedKey?.set(typeof options.lineNumbers === "string" ? options.lineNumbers : "on");
    }

    /** Get the resolved options. Do not update the options this way */
    public getOptions(): CombinedEditorOptions {
        return this.layeredOptions.get();
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
        return !!this.getOptions().readOnly;
    }

    public getMarkerStat(owner?: string): MarkerStat {
        return this.model.getMarkerStat(owner);
    }

    public internalOnNotifiedMarkerChanged(uris: string[]) {
        const uriSelf = this.model.innerModel().uri.toString();
        if (uris.includes(uriSelf)) {
            this.model.updateMarkerStat();
            this.eventMap.dispatch({
                type: EditorEventType.MarkerChanged
            });
        }
    }
}
