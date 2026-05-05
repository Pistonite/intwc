
export interface FileEditorProps extends CommonEditorProps {
    value: string;
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

    /** if the editor is readonly. */
    readonly?: boolean;

    /** */
    allowSetWhenReadonly?: boolean;
}
