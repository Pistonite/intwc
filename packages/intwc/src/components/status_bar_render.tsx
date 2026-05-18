import type { RefObject } from "react";
import type { TranslatorFn } from "@pistonite/celera";

import { type SingleFileEditorState } from "#state";

import { StatusBarItem } from "./status_bar.tsx";
import { type StatusItem, StatusItemPreset } from "./status_types.ts";
import { Codicon } from "./icon.tsx";
import type { useEditorStyles } from "./style.ts";

interface RenderContext {
    isWordWrapOn: boolean;
    editorRef: RefObject<SingleFileEditorState | null>;
    language: string | undefined;
    languageName: string;
    numError: number;
    numWarning: number;
    numHint: number;
    posLine: number;
    posCol: number;
    filename: string | undefined;
    styles: ReturnType<typeof useEditorStyles>;
    t: TranslatorFn;
}

export const makeStatusBarItemRenderer =
    (ctx: RenderContext) =>
    (i: number, item: StatusItem): React.ReactNode => {
        const {
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
            styles,
            t,
        } = ctx;
        if (item === StatusItemPreset.WordWrap) {
            return (
                <StatusBarItem
                    key={i}
                    onClick={() => {
                        editorRef.current?.overrideOptions({
                            wordWrap: isWordWrapOn ? "off" : "on",
                        });
                    }}
                >
                    <Codicon icon="word-wrap" />
                    {t("status.word_wrap.label")}:{" "}
                    {isWordWrapOn ? t("generic.on_lower") : t("generic.off_lower")}
                </StatusBarItem>
            );
        }
        if (item === StatusItemPreset.LanguageId) {
            return (
                <StatusBarItem key={i}>
                    <Codicon icon="code" />
                    {language}
                </StatusBarItem>
            );
        }
        if (item === StatusItemPreset.Language) {
            return (
                <StatusBarItem key={i}>
                    <Codicon icon="code" />
                    {languageName}
                </StatusBarItem>
            );
        }
        if (item === StatusItemPreset.DiagnosticErrors) {
            if (!numError) {
                return null;
            }
            return (
                <StatusBarItem key={i} className={styles.red}>
                    <Codicon icon="error" />
                    {numError}
                </StatusBarItem>
            );
        }
        if (item === StatusItemPreset.DiagnosticWarnings) {
            if (!numWarning) {
                return null;
            }
            return (
                <StatusBarItem key={i} className={styles.yellow}>
                    <Codicon icon="warning" />
                    {numWarning}
                </StatusBarItem>
            );
        }
        if (item === StatusItemPreset.DiagnosticHints) {
            if (!numHint) {
                return null;
            }
            return (
                <StatusBarItem key={i}>
                    <Codicon icon="lightbulb" />
                    {numHint}
                </StatusBarItem>
            );
        }
        if (item === StatusItemPreset.Position) {
            return (
                <StatusBarItem key={i}>
                    {t("status.position.label", {
                        line: posLine,
                        col: posCol,
                    })}
                </StatusBarItem>
            );
        }
        if (item === StatusItemPreset.File) {
            if (filename) {
                return <StatusBarItem key={i}>{filename}</StatusBarItem>;
            }
            return null;
        }
        if (typeof item === "string") {
            return <StatusBarItem key={i}>{item}</StatusBarItem>;
        }
        const { onClick, body } = item;
        return <StatusBarItem onClick={onClick}>{body}</StatusBarItem>;
    };
