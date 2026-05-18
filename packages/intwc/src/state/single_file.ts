import * as monaco from "@pistonite/intwc/monaco";

import {
    type CombinedEditorOptions,
    Position,
    type ITextModel,
    type IStandaloneCodeEditor,
    getFileUri,
} from "#util";
import { provideMarkers } from "#language";
import { log } from "#log";

import { createTextModelOptions, LayeredOptions } from "./option.ts";
import {
    type EditorEventFn,
    EditorEventMap,
    EditorEventType,
    type FileEditorEvent,
} from "./event.ts";
import { FileModel, type MarkerStat } from "./model_ref.ts";
import { addEditorActions } from "./action.ts";
import { nextEditorId, registerEditor } from "./editor_registry.ts";
import { ManagedEditorPreference } from "./editor_preference.ts";

export class SingleFileEditorState {
    private id: number;
    private instance: IStandaloneCodeEditor;
    private model: FileModel;
    private eventMap: EditorEventMap<FileEditorEvent>;
    private editorCleanup: () => void;
    private layeredOptions: LayeredOptions;
    private managedPreference: ManagedEditorPreference;

    constructor(
        persistId: string,
        private domNode: HTMLDivElement,
        fromPropsOptions: CombinedEditorOptions | undefined,
        filename: string,
        language: string,
    ) {
        this.id = nextEditorId();
        log.info(`creating editor state [id=${this.id}]`);
        this.layeredOptions = new LayeredOptions(fromPropsOptions);
        const resolvedOptions = this.layeredOptions.get();
        this.eventMap = new EditorEventMap();
        this.editorCleanup = () => {};
        // create the editor instance
        this.instance = monaco.editor.create(domNode, resolvedOptions);

        // load persisted preference
        this.managedPreference = new ManagedEditorPreference(this.instance, persistId);
        const persistedOptions = this.managedPreference.load(resolvedOptions);
        if (persistedOptions) {
            const newResolvedOptions = this.layeredOptions.overrideOptions(persistedOptions);
            this.instance.updateOptions(newResolvedOptions);
        }
        this.setupEditor();

        const model = monaco.editor.createModel(
            "",
            language,
            getFileUri(this.makeInternalFilename(filename)),
        );
        model.updateOptions(createTextModelOptions(this.layeredOptions.get()));
        this.model = new FileModel(filename, model);
        this.model.setCleanupFn(this.setupModel(this.model, this.model.innerModel()));

        this.instance.setModel(model);

        // provide markers initially
        this.updateMarkers(this.model);
    }

    /** Recreate the monaco editor instance. */
    public recreate() {
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
        log.info(`setting up underlying editor [id=${this.id}]`);
        const unregisterEditor = registerEditor(this.instance, this);
        this.managedPreference.rebind(this.instance);
        this.managedPreference.register();
        addEditorActions(this.instance);
        this.managedPreference.updateSelfOnly(this.getOptions());

        const cursorListener = this.instance.onDidChangeCursorPosition(() => {
            this.eventMap.dispatch({
                type: EditorEventType.CursorPositionChanged,
            });
        });

        this.editorCleanup = () => {
            log.info(`disposing underlying editor [id=${this.id}]`);
            cursorListener.dispose();
            this.managedPreference.dispose();
            unregisterEditor();
        };
    }

    private setupModel(model: FileModel, innerModel: ITextModel) {
        const contentListener = innerModel.onDidChangeContent(() => {
            this.updateMarkers(model);
            this.eventMap.dispatch({
                type: EditorEventType.ContentChanged,
            });
        });
        return () => {
            contentListener.dispose();
        };
    }

    private updateMarkers(model: FileModel) {
        provideMarkers(model.getFilename(), model, this.getCursorCharOffset());
    }

    public subscribe(
        eventType: EditorEventType,
        callback: EditorEventFn<FileEditorEvent>,
    ): () => void {
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
        log.info(`destroying editor state [id=${this.id}]`);
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
        this.managedPreference.updateSelfOnly(newResolvedOptions);
        this.eventMap.dispatch({ type: EditorEventType.OptionChanged });
    }

    public overrideOptions(
        newOptions: CombinedEditorOptions | undefined,
        isNotifiedByOtherEditor = false,
    ) {
        const newResolvedOptions = this.layeredOptions.overrideOptions(newOptions);
        this.instance.updateOptions(newResolvedOptions);
        this.model.innerModel().updateOptions(createTextModelOptions(newResolvedOptions));
        if (isNotifiedByOtherEditor) {
            this.managedPreference.updateSelfOnly(newResolvedOptions);
        } else {
            this.managedPreference.updateEverywhere(newOptions, newResolvedOptions);
        }
        this.eventMap.dispatch({ type: EditorEventType.OptionChanged });
    }

    /** Get the resolved options. Do not update the options this way */
    public getOptions(): CombinedEditorOptions {
        return this.layeredOptions.get();
    }

    private makeInternalFilename(filename: string) {
        return "editor" + this.id + "/" + filename;
    }

    /**
     * Set the name (path) of the file model.
     *
     * Since Uris are immutable, this deletes the model and recreates one
     */
    public setFilename(filename: string) {
        this.model.recreateModelWithFilename(
            this.makeInternalFilename(filename),
            this.instance,
            (newModel) => {
                return this.setupModel(this.model, newModel);
            },
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
        return this.instance.getPosition() || new Position(1, 1);
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
                type: EditorEventType.MarkerChanged,
            });
        }
    }
}
