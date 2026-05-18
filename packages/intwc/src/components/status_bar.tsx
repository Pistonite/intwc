import type { PropsWithChildren } from "react";
import { Caption1, mergeClasses } from "@fluentui/react-components";

import type { CustomStatusItem } from "./status_types.ts";
import { useEditorStyles } from "./style.ts";

export type StatusBarItemProps = {
    className?: string;
} & Omit<CustomStatusItem, "body">;
export const StatusBarItem: React.FC<PropsWithChildren<StatusBarItemProps>> = (props) => {
    const c = useEditorStyles();
    const { onClick, className, children } = props;
    if (onClick) {
        return (
            <Caption1
                className={mergeClasses(c.statusItem, c.statusButton, className)}
                onClick={onClick}
            >
                {children}
            </Caption1>
        );
    }
    return <Caption1 className={mergeClasses(c.statusItem, className)}>{children}</Caption1>;
};
