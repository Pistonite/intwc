export const StatusItem = {
    WordWrap: 1,
    Language: 3,
    DiagnosticErrors: 4,
    DiagnosticWarnings: 5,
    DiagnosticHints: 6,
    DiagnosticInfos: 7,
    Position: 8,
    File: 9,
} as const;
export type StatusItem = typeof StatusItem[keyof typeof StatusItem];
export interface CustomStatusItem {
    onClick?: () => void | Promise<void>,
    body: React.ReactNode
}

export const StatusBarItem: React.FC<{ item: StatusItem | CustomStatusItem }>
 = (props) => {
    const { item } = props; 
    if (typeof item === "object") {
        const { onClick, body } = item;
        if (onClick) {
            return (
                    <span 
                        className="intwc-status-button intwc-status-label"
                        onClick={onClick}
                    >
                        {body}
                    </span>
            );
        } 
        return (
                    <span className="intwc-status-label" >
                        {body}
                    </span>
        );
    }
}
