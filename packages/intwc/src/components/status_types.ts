
export type StatusItem = StatusItemPreset | CustomStatusItem | string;
export interface CustomStatusItem {
    onClick?: () => void | Promise<void>,
    body: React.ReactNode
}
export const StatusItemPreset = {
    WordWrap: 1,
    LanguageId: 2,
    Language: 3,
    DiagnosticErrors: 4,
    DiagnosticWarnings: 5,
    DiagnosticHints: 6,
    Position: 8,
    File: 9,
} as const;
export type StatusItemPreset = typeof StatusItemPreset[keyof typeof StatusItemPreset];
