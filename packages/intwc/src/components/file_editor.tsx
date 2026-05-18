import { useEffect, useRef, useState } from "react";
import { mergeClasses } from "@fluentui/react-components";
import { useDark, useTranslation } from "@pistonite/celera";

import { EditorEventType, isWordWrapEnabledInOptions, SingleFileEditorState } from "#state";

import { useMonacoLanguageName, type CommonEditorProps } from "./common.ts";
import { useEditorStyles } from "./style.ts";
import { makeStatusBarItemRenderer } from "./status_bar_render.tsx";

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
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    onCreated?: (editor: SingleFileEditorState) => void | (() => void);

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

    const dark = useDark();
    const c = useEditorStyles();
    const t = useTranslation("intwc");

    const { onCreated, editorOptions, filename, language, statusLeft, statusRight, persistId } =
        props;

    // -- status items --
    const [isWordWrapOn, setWordWrap] = useState(
        editorOptions ? isWordWrapEnabledInOptions(editorOptions) : false,
    );
    const languageName = useMonacoLanguageName(language);
    const [numError, setNumErrors] = useState(0);
    const [numWarning, setNumWarnings] = useState(0);
    const [numHint, setNumHints] = useState(0);
    const [posLine, setPosLine] = useState(1);
    const [posCol, setPosCol] = useState(1);

    const editorRef = useRef<SingleFileEditorState>(null);
    const [domNode, setDomNode] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!domNode) {
            return;
        }
        const editor = new SingleFileEditorState(
            persistId || "",
            domNode,
            editorOptions,
            filename || "file",
            language || "text",
        );
        editorRef.current = editor;
        // connect statusbar state
        const optionCleanup = editor.subscribe(EditorEventType.OptionChanged, () => {
            const options = editor.getOptions();
            const newWordWrapOn = isWordWrapEnabledInOptions(options);
            setWordWrap(newWordWrapOn);
        });
        const markerCleanup = editor.subscribe(EditorEventType.MarkerChanged, () => {
            const { numHint, numWarning, numError } = editor.getMarkerStat();
            setNumErrors(numError);
            setNumWarnings(numWarning);
            setNumHints(numHint);
        });
        const posCleanup = editor.subscribe(EditorEventType.CursorPositionChanged, () => {
            const pos = editor.getCursorPosition();
            setPosLine(pos.lineNumber);
            setPosCol(pos.column);
        });
        const cleanup = onCreated?.(editor);
        return () => {
            posCleanup();
            markerCleanup();
            optionCleanup();
            editorRef.current = null;
            cleanup?.();
            editor.dispose();
        };
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domNode]);

    useEffect(() => {
        editorRef.current?.updateFromPropsOptions(editorOptions);
    }, [editorOptions]);

    useEffect(() => {
        editorRef.current?.setFilename(filename || "file");
    }, [filename]);

    useEffect(() => {
        editorRef.current?.setLanguage(language || "text");
    }, [language]);

    // disable: editorRef is not accessed during render
    // eslint-disable-next-line react-hooks/refs
    const renderItem = makeStatusBarItemRenderer({
        isWordWrapOn,
        editorRef,
        language,
        languageName,
        numError,
        numWarning,
        numHint,
        posLine,
        posCol,
        filename,
        styles: c,
        t,
    });

    let $Status: React.ReactNode | null = null;
    if (statusLeft || statusRight) {
        const $Left = statusLeft?.map((item, i) => renderItem(i, item));
        const $Right = statusRight?.map((item, i) => renderItem(i, item));
        $Status = (
            <div className={c.statusBar}>
                {$Left}
                <span className={c.statusBarRight}>{$Right}</span>
            </div>
        );
    }

    return (
        <div className={mergeClasses(c.wrapper, dark ? c.colorDark : c.colorLight)}>
            <div className={c.editorWrapper}>
                <div ref={setDomNode} className={c.editorNode} />
            </div>
            {$Status}
        </div>
    );
};
