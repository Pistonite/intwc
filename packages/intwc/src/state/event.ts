/** Event type emitted by the editor */
export const EditorEventType = {
    ContentChanged: 1,
    CursorPositionChanged: 2,
};
/** Event type emitted by the editor */
export type EditorEventType = typeof EditorEventType[keyof typeof EditorEventType];

/** Event handler callback */
export type EditorEventFn<TEvent> = (e: TEvent) => void | Promise<void>;

/** Base editor event object */
export interface FileEditorEvent {
    type: EditorEventType
}

/** Extra event properties for multi-file editor */
export interface MultiFileEditorEvent extends FileEditorEvent{
    filename: string
}

export class EditorEventMap<TEvent extends FileEditorEvent> {
    private subscribers: Map<EditorEventType, EditorEventFn<TEvent>[]> = new Map();

    public subscribe(eventType: EditorEventType, callback: EditorEventFn<TEvent>): () => void {
        let subscribers = this.subscribers.get(eventType);
        if (!subscribers) {
            subscribers = [];
            this.subscribers.set(eventType, subscribers);
        }
        subscribers.push(callback);
        return () => {
            const subscribers = this.subscribers.get(eventType);
            if (!subscribers) {
                return;
            }
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    }

    public dispatch(event: TEvent): void {
        const subscribers = this.subscribers.get(event.type);
        subscribers?.forEach((subscriber) => subscriber(event));
    }
}
