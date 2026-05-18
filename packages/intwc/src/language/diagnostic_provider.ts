import { safeidgen } from "@pistonite/pure/memory";

import type { IMarkerData, ITextModel } from "#util";
import type { FileModel } from "#state";

/**
 * The interface implemented by language services to integrate
 * with the diagnostic system
 */
export interface DiagnosticProvider<T, D extends IMarkerData> {
    /**
     * The owner ID for this diagnostic provider.
     *
     * Providers with different owner ID will not interfer with
     * each other's diagnostic markers
     */
    ownerId: string;

    /**
     * Callback for a new request to generate diagnostic markers.
     *
     * Return a seriers of DiagnosticTasks. The returned tasks
     * will be awaited in serial (in the order they are returned).
     * Once a task is finished, the markers will be updated based on
     * the `order` of the returned data.
     *
     * The host should decide how it wants to split up the tasks.
     * or process the whole request as one if it's cheap to do.
     */
    newRequest: (
        filename: string,
        model: ITextModel,
        text: string,
        charPos: number,
    ) => Promise<DiagnosticTask<T>[]>;

    /**
     * Merge currently cached data and new data returned by the latest task.
     *
     * The implementation could reuse current markers if generating new ones is expensive.
     *
     * This is called one extra time at the end with currData  === newData,
     * for any left over old markesr to be deleted
     */
    mergeData: (
        model: ITextModel,
        currentData: T[],
        newBatch: T[],
        previousBatch: T[],
        currentMarkers: D[],
    ) => DiagnosticMergeResult<T, D>;
}

/** handle for part of a diagnostic request, known as a task */
export interface DiagnosticTask<T> {
    /**
     * The data included in this task
     * If undefined is returned, this response is ignored, and previous markers
     * won't be cleared. This can be used to indicate failure
     */
    data: Promise<T[] | undefined>;
}

export interface DiagnosticMergeResult<T, D extends IMarkerData> {
    /** Data to replace the currently cached data */
    nextData: T[];
    /** Markers to replace the current set of markers */
    nextMarkers: D[];
}

const getNextDiagnosticId = safeidgen(500000);

/** Glue code to drive a provider whenever diagnostics needs to be updated */
class DiagnosticDriver<T, D extends IMarkerData> {
    private provider: DiagnosticProvider<T, D>;
    private cachedData: T[];
    private cachedMarkers: D[];
    private serial: number;

    constructor(provider: DiagnosticProvider<T, D>) {
        this.provider = provider;
        this.cachedData = [];
        this.cachedMarkers = [];
        this.serial = 0;
    }

    public async updateMarkers(
        filename: string,
        model: FileModel,
        charPos: number,
    ): Promise<boolean> {
        this.serial = getNextDiagnosticId();
        const serial = this.serial;
        const activeTextModel = model.innerModel();
        const activeText = model.getContent();
        // start a new request
        const tasks = await this.provider.newRequest(
            filename,
            activeTextModel,
            activeText,
            charPos,
        );
        if (serial !== this.serial || !model.isCurrent(activeTextModel)) {
            return false;
        }

        let previousBatch: T[] = [];
        const len = tasks.length;
        for (let i = 0; i < len; i++) {
            const { data } = tasks[i];
            const newBatch = await data;
            if (serial !== this.serial || !model.isCurrent(activeTextModel)) {
                return false;
            }
            if (!newBatch) {
                continue;
            }
            const mergeResult = this.provider.mergeData(
                activeTextModel,
                this.cachedData,
                newBatch,
                previousBatch,
                this.cachedMarkers,
            );
            this.cachedData = mergeResult.nextData;
            this.cachedMarkers = mergeResult.nextMarkers;
            model.setMarkers(this.provider.ownerId, this.cachedMarkers);
            previousBatch = newBatch;
        }
        if (len > 0) {
            const mergeResult = this.provider.mergeData(
                activeTextModel,
                this.cachedData,
                this.cachedData,
                this.cachedData,
                this.cachedMarkers,
            );
            this.cachedData = mergeResult.nextData;
            this.cachedMarkers = mergeResult.nextMarkers;
            model.setMarkers(this.provider.ownerId, this.cachedMarkers);
        }
        return true;
    }
}

/** Language ID to registered drivers */
const registry = new Map<string, DiagnosticDriver<unknown, IMarkerData>[]>();
export const registerDiagnosticProvider = <T, D extends IMarkerData>(
    languageId: string,
    provider: DiagnosticProvider<T, D>,
) => {
    const driver = new DiagnosticDriver(provider);
    const providers = registry.get(languageId);
    if (!providers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        registry.set(languageId, [driver as any]);
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    providers.push(driver as any);
};

/**
 * Start a new provide marker request.
 */
export const provideMarkers = (filename: string, model: FileModel, charPos: number): void => {
    const languageId = model.getLanguage();
    const providers = registry.get(languageId);
    if (!providers) {
        return;
    }
    providers.forEach((provider) => {
        void provider.updateMarkers(filename, model, charPos);
    });
};
