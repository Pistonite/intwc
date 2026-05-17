import * as monaco from "@pistonite/intwc/monaco";

import { 
    type ITextModel, type IStandaloneCodeEditor,
    type IMarkerData,
    MarkerSeverity,
    type Position
} from "#util";

export class FileModel {
    private markerStatByOwner: Map<string, MarkerStat> = new Map();
    private markerStatTotal: MarkerStat;
    private modelCleanupFn: () => void;

    constructor(
        private filename: string,
        private model: ITextModel,
    ) {
        this.markerStatTotal = {
            numHint: 0,
            numInfo: 0,
            numWarning: 0,
            numError: 0
        };
        this.modelCleanupFn = () => {};
    }

    public getFilename(): string {
        return this.filename;
    }

    public setCleanupFn(modelCleanup: () => void) {
        this.modelCleanupFn = modelCleanup;
    }

    public innerModel(): ITextModel {
        return this.model;
    }

    public isCurrent(m: ITextModel): boolean {
        return m === this.model && !this.model.isDisposed();
    }

    public dispose() {
        if (!this.model.isDisposed()) {
            this.modelCleanupFn();
            this.model.dispose();
        }
    }

    public recreateModelWithFilename(filename: string, editor: IStandaloneCodeEditor
        ,setup: (model: ITextModel) => () => void
    ) {
        if (this.filename === filename) {
            return undefined;
        }
        const currentModel = editor.getModel();
        const newModel = monaco.editor.createModel(
            this.model.getValue(),
            this.model.getLanguageId(),
            this.model.uri,
        );
        const oldModel = this.model;
        // update new model state to have the same things as the old model
        const oldMarkers = monaco.editor.getModelMarkers({ resource: oldModel.uri, });
        const newMarkersByOwner = new Map<string, IMarkerData[]>();
        const oldMarkersLen = oldMarkers.length;
        for (let i = 0;i<oldMarkersLen;i++) {
            const marker = oldMarkers[i];
            const data = convertMarkerToMarkerData(marker);
            let newMarkers = newMarkersByOwner.get(marker.owner);
            if (!newMarkers) {
                newMarkers = [data];
                newMarkersByOwner.set(marker.owner, newMarkers);
            } else {
                newMarkers.push(data);
            }
        }
        for (const [owner, markers] of newMarkersByOwner.entries()) {
            monaco.editor.setModelMarkers(newModel, owner, markers);
        }

        if (currentModel !== oldModel) {
            this.model = newModel;
            this.modelCleanupFn();
            this.modelCleanupFn = setup(newModel);
        } else {
            // also set position of the editor
            const oldPosition = editor.getPosition();
            this.model = newModel;
            this.modelCleanupFn();
            this.modelCleanupFn = setup(newModel);
            editor.setModel(newModel);
            if (oldPosition) {
                editor.setPosition(oldPosition);
            }
        }
        oldModel.dispose();
    }

    public setMarkers(owner: string, markers: IMarkerData[]) {
        monaco.editor.setModelMarkers(this.model, owner, markers);
    }

    public updateMarkerStat() {
        // refresh the cached marker stat.
        // Although we could do it more efficiently in setMarkers(),
        // that doesn't cover built-in diagnostics (like TypeScript LSP)
        // or calls to setModelMarkers outside of our control
        const markers = monaco.editor.getModelMarkers({
            resource: this.model.uri
        });

        this.markerStatByOwner.clear();
        let numHint = 0;
        let numInfo = 0;
        let numWarning = 0;
        let numError = 0;
        const len = markers.length;
        for (let i = 0;i<len;i++) {
            const marker = markers[i];
            const owner = marker.owner;
            let data = this.markerStatByOwner.get(owner);
            if (!data) {
                data = {
                    numHint: 0,
                    numInfo: 0,
                    numWarning: 0,
                    numError: 0
                };
                this.markerStatByOwner.set(owner, data);
            }
            switch (marker.severity) {
                case MarkerSeverity.Hint: {
                    numHint++;
                    data.numHint++;
                    break;
                }
                case MarkerSeverity.Info: {
                    numInfo++;
                    data.numInfo++;
                    break;
                }
                case MarkerSeverity.Warning: {
                    numWarning++;
                    data.numWarning++;
                    break;
                }
                case MarkerSeverity.Error: {
                    numError++;
                    data.numError++;
                    break;
                }
            }
        }
        this.markerStatTotal = {
            numHint,
            numInfo,
            numWarning,
            numError
        };
    }

    public getMarkerStat(owner?: string): MarkerStat {
        if (owner) {
            return this.markerStatByOwner.get(owner)
            || {
                    numHint: 0,
                    numInfo: 0,
                    numWarning: 0,
                    numError: 0,
                };
        }
        return { ...this.markerStatTotal };
    }

    public setLanguage(language: string) {
        monaco.editor.setModelLanguage(this.model, language);
    }

    public getLanguage() {
        return this.model.getLanguageId();
    }

    public setContent(newContent: string, force = false) {
        if (!force && newContent === this.model.getValue()) {
                return;
        }
        this.model.setValue(newContent);
    }

    public getContent(): string {
        return this.model.getValue();
    }

    public getCharOffsetAt(position: Position): number {
        return this.model.getOffsetAt(position) || 0;
    }

    public getPositionFromCharOffset(charPos: number): Position {
        return this.model.getPositionAt(charPos);
    }
}

const convertMarkerToMarkerData = (marker: monaco.editor.IMarker): IMarkerData => {
    const { code, relatedInformation, tags, ...rest } = marker;
    // deep-clone to refresh the reference for mutable fields
    // in case of reference bugs
    return {
        code: typeof code === "object"
            ? { ...code }
            : code,
        relatedInformation: relatedInformation?.map((x) => ({...x})),
        tags: tags?.map((x) => x),
        ...rest,
    };
}

export interface MarkerStat {
    numHint: number,
    numInfo: number,
    numWarning: number,
    numError: number,
}
