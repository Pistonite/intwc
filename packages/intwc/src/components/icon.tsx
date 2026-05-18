import type { CodiconIconName } from "./codicon.gen.ts";
export type { CodiconIconName };

export const Codicon: React.FC<{ icon: CodiconIconName }> = (props) => {
    return <i className={`codicon codicon-${props.icon}`}></i>;
};
