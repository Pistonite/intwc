import * as monaco from "@pistonite/intwc/monaco";
import { useMemo } from "react";

import type { CombinedEditorOptions } from "#util";

import type { StatusItem } from "./status_types.ts";


export interface CommonEditorProps {
    /** 
     * Options to create or update the editor.
     *
     * Passed to the editor `create()` function, and when the reference changes,
     * will call `updateOptions` on the editor instance. Either manually memoize
     * this value or use react compiler to keep stable reference.
     */
    editorOptions?: CombinedEditorOptions,

    /** Status bar items on the left. Not setting either left or right hides the bar */
    statusLeft?: StatusItem[]
    /** Status bar items on the right. Not setting either left or right hides the bar */
    statusRight?: StatusItem[]
}

export const useMonacoLanguageName = (languageId: string | undefined): string => {
    return useMemo(() => {
        if (!languageId) {
            return "Text";
        }
        return monaco.languages.getLanguages().find((x) =>x.id === languageId)
        ?.aliases?.[0] ?? languageId;
    }, [languageId]);
}


