import * as monaco from "@pistonite/intwc/monaco";
import { type HTMLProps, useEffect, useMemo, useRef, useState } from "react";

import { SingleFileEditorState } from "#state";

import { useMonacoLanguageName, type CommonEditorProps } from "./common.ts";
import { resolveEditorOptions } from "../state/option.ts";

export interface FileEditorProps extends CommonEditorProps, HTMLProps<HTMLDivElement> {
    /**
     * Creation function called with the editor API for external code to interact
     * with the editor state.
     *
     * The function can return a clean up function which will be called
     * when the editor is re-created. Because the editor is tied to the life-cycle
     * of the component, create and clean-up must not be async, and you should
     * not hold on to a dangling editor instance after it's been cleaned up. 
     */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    onCreated?: (editor: SingleFileEditorState) => (void | (() => void))

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
export const FileEditor: React.FC<FileEditorProps> = (props) => {
    // cannot optimize because we manually don't want the effect to be called
    // unless the dom node changes
    "use no memo";

    const { onCreated, editorOptions, filename, language, ...restProps } = props;
    const [isWordWrapOn, setWordWrap] = useState(editorOptions?.wordWrap !== "off");
    // const [isLineNumbersOn, setLineNumbers] = useState<string>(editorOptions?.lineNumbers ?? "on");

    const resolvedOptions = useMemo(() => {
        const opt = resolveEditorOptions(editorOptions);
        opt.wordWrap = isWordWrapOn ? "on" : "off";
        return opt;
    }, [editorOptions, isWordWrapOn]);
    const languageName = useMonacoLanguageName(language);

    const editorRef = useRef<SingleFileEditorState>(null);
    const [domNode, setDomNode] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!domNode) {
            return;
        }
        const editor = new SingleFileEditorState(
            domNode, 
            resolvedOptions,
            filename || "file",
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
        editorRef.current?.setOptions(resolvedOptions);
    }, [resolvedOptions]);

    useEffect(() => {
        editorRef.current?.setFilename(filename || "file");
    }, [filename]);

    useEffect(() => {
        editorRef.current?.setLanguage(language || "text");
    }, [language]);

    // TODO: localization
    return  (
        <div style={{height: "100%", display: "flex", flexDirection: "column"}}>
            <div style={{flex: 1, minWidth: 0, minHeight: 0}}>
            <div ref={setDomNode} style={{ height: "100%"  }} {...restProps} />
            </div>
            <div className="intwc-status-bar">
                <span className="intwc-status-label">
                    Status Bar Here
                </span>
                <span style={{
                    flex: 1,
                    display: "inline-flex",
                    justifyContent: "right"
                }}>
                    <span className="intwc-status-button intwc-status-label"
                        onClick={() => {
                            setWordWrap((x) => !x);
                        }}
                    >
                        <i className="codicon codicon-add"></i>
                        Line Numbers: {isWordWrapOn ? "on" : "off"}
                    </span>
                    <span className="intwc-status-button intwc-status-label"
                        onClick={() => {
                            setWordWrap((x) => !x);
                        }}
                    >
                        Wrap: {isWordWrapOn ? "on" : "off"}
                    </span>
                    <span className="intwc-status-label">
                        {language}
                    </span>
                </span>
            </div>
        </div>);
};
