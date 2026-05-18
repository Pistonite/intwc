import { makeStyles } from "@fluentui/react-components";

export const useEditorStyles = makeStyles({
    wrapper: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative", // needed for styles from monaco to anchor properly
    },
    colorDark: {
        "--background": "#181825",
        "--text": "#bac2de",
        "--border": "#313244",
        "--button-hl-back": "#313244",
        "--button-hl": "#cdd6f4",
        "--red": "#f38ba8",
        "--yellow": "#f9e2af",
    },
    colorLight: {},
    editorWrapper: {
        // needed to size the editor properly
        flex: 1,
        minWidth: 0,
        minHeight: 0,
    },
    editorNode: {
        height: "100%",
    },
    statusBar: {
        padding: "0 6px",
        background: "var(--background)",
        color: "var(--text)",
        borderTop: "1px solid var(--border)",
        boxSizing: "border-box",
        display: "flex",
    },
    statusBarRight: {
        flex: 1,
        display: "inline-flex",
        justifyContent: "right",
    },
    statusItem: {
        padding: "2px 6px",
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        minWidth: 0,
        flexShrink: 1,
        overflow: "hidden",
        whiteSpace: "nowrap",
    },
    statusButton: {
        borderRadius: "2px",
        ":hover": {
            background: "var(--button-hl-back)",
            color: "var(--button-hl)",
            cursor: "pointer",
        },
    },
    red: {
        color: "var(--red)",
    },
    yellow: {
        color: "var(--yellow)",
    },
});
