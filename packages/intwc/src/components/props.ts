import type { CombinedEditorOptions, IEditorOptions, IGlobalEditorOptions } from "#util";


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



