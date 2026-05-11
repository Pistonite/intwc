import { type HTMLProps, useEffect, useRef, useMemo } from "react";

import { EditorEventType, resolveSimpleEditorOptions, type SingleFileEditorState } from "#state";

import type { CommonEditorProps } from "./common.ts";
import { FileEditor } from "./file_editor.tsx";

export interface SimpleEditorProps extends CommonEditorProps, HTMLProps<HTMLDivElement> {
    /** Controlled value for the editor */
    value: string;

    /** Callback when value changes; used to set external state */
    onValueChange: (newValue: string) => void;

    /**
     * The path to the file, which may show up in some UIs like diagnostic
     * messages. Converted to a Uri internally.
     */
    filename?: string;

    /**
     * Language of the file being edited
     */
    language?: string;
}

export const SimpleEditor: React.FC<SimpleEditorProps> = (props) => {
    const { value, onValueChange, editorOptions, ...restProps } = props;

    const editorRef = useRef<SingleFileEditorState>(null);
    const resolvedOptions = useMemo(() => {
        return resolveSimpleEditorOptions(editorOptions);
    }, [editorOptions])

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.setContent(value, editorRef.current.isReadonly());
        }
    }, [value]);

    return <FileEditor
        onCreated={(editor) => {
            editorRef.current = editor;
            editor.setContent(value, true /* force */);
            return editor.subscribe(EditorEventType.ContentChanged, () => {
                onValueChange(editor.getContent());
            });
        }}
        editorOptions={resolvedOptions}
        {...restProps}
    />;
}
