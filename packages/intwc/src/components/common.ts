import * as monaco from "@pistonite/intwc/monaco";
import { useMemo } from "react";

import type { CombinedEditorOptions } from "#util";


export interface CommonEditorProps {
    /** 
     * Options to create or update the editor.
     *
     * Passed to the editor `create()` function, and when the reference changes,
     * will call `updateOptions` on the editor instance. Either manually memoize
     * this value or use react compiler to keep stable reference.
     */
    editorOptions?: CombinedEditorOptions
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


