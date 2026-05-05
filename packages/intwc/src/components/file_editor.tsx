import { forwardRef, HTMLProps, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { SingleFileEditorState } from "#state";

import { CommonEditorProps } from "./props.ts";
import { Uri } from "#util";
import { resolveEditorOptions } from "../state/option.ts";

export interface FileEditorProps extends CommonEditorProps {
    /**
     * Creation function called with the editor API for external code to interact
     * with the editor state.
     *
     * The function can return a clean up function which will be called
     * when the editor is re-created. Because the editor is tied to the life-cycle
     * of the component, create and clean-up must not be async, and you should
     * not hold on to a dangling editor instance after it's been cleaned up. 
     */
    onCreated?: (editor: SingleFileEditorState) => undefined | (() => void)

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
export const FileEditor: React.FC<FileEditorProps & HTMLProps<HTMLDivElement>> = (props) => {
    // cannot optimize because we manually don't want the effect to be called
    // unless the dom node changes
    "use no memo";

    const { onCreated, editorOptions, filename, language } = props;
    const resolvedOptions = useMemo(() => {
        return resolveEditorOptions(editorOptions);
    }, [editorOptions]);

    const editorRef = useRef<SingleFileEditorState>(null);
    const [domNode, setDomNode] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!domNode) {
            return;
        }
        const editor = new SingleFileEditorState(
            domNode, 
            resolvedOptions,
            Uri.file(filename || "file"),
            language || "text"
        );
        editorRef.current = editor;
        const cleanup = onCreated?.(editor);
        return () => {
            editorRef.current = null;
            cleanup?.();
            editor.dispose();
        };
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domNode]);

    useEffect(() => {
        if (!editorRef.current) {
            return;
        }
        editorRef.current.setOptions(resolvedOptions);
    }, [resolvedOptions]);

    useEffect(() => {
        if (!editorRef.current) {
            return;
        }
        editorRef.current.setFileUri(Uri.file(filename || "file"));
    }, [filename]);

    useEffect(() => {
        if (!editorRef.current) {
            return;
        }
        editorRef.current.setLanguage(language || "text");
    }, [language]);

    return <div ref={setDomNode} style={{ height: "100%" }} {...props} />;
};
