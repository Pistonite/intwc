/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See ./LICENSE
 *--------------------------------------------------------------------------------------------*/

import type { IMatch } from "./base_common_filters.ts";
import type { IMarkdownString } from "./base_common_htmlContent.ts";
import type { ResolvedKeybinding } from "./base_common_keybindings.ts";
import type { URI } from "./base_common_uri.ts";

// https://github.com/microsoft/vscode/blob/main/src/vs/platform/quickinput/common/quickInput.ts
export type QuickPickItem = IQuickPickSeparator | IQuickPickItem;
/**
 * Represents a quick pick item used in the quick pick UI.
 */
export interface IQuickPickItem extends IQuickItem {
	/**
	 * The type of the quick pick item. Used to distinguish between 'item' and 'separator'
	 */
	type?: 'item';
	/**
	 * The detail text of the quick pick item. Shown as the second line.
	 */
	detail?: string;
	/**
	 * The tooltip for the quick pick item.
	 */
	tooltip?: string | IMarkdownString;
	highlights?: IQuickPickItemHighlights;
	/**
	 * Allows to show a keybinding next to the item to indicate
	 * how the item can be triggered outside of the picker using
	 * keyboard shortcut.
	 */
	keybinding?: ResolvedKeybinding;
	/**
	 * Whether the item is picked by default when the Quick Pick is shown.
	 */
	picked?: boolean;
	/**
	 * Whether the item is always shown in the Quick Pick regardless of filtering.
	 */
	alwaysShow?: boolean;
	/**
	 * Defaults to true with `IQuickPick.canSelectMany`, can be false to disable picks for a single item
	 */
	pickable?: boolean;
}
export interface IQuickPickSeparator {
	/**
	 * The type of the quick pick item. Used to distinguish between 'item' and 'separator'
	 */
	type: 'separator';
	id?: string;
	label?: string;
	description?: string;
	ariaLabel?: string;
	buttons?: readonly IQuickInputButton[];
	tooltip?: string | IMarkdownString;
}
/**
 * Base properties for a quick pick and quick tree item.
 */
export interface IQuickItem {
	id?: string;
	label: string;
	ariaLabel?: string;
	description?: string;
	/**
	 * Whether the item is displayed in italics.
	 */
	italic?: boolean;
	/**
	 * Whether the item is displayed with a strikethrough.
	 */
	strikethrough?: boolean;
	/**
	 * Icon classes to be passed on as `IIconLabelValueOptions`
	 * to the underlying `IconLabel` widget.
	 */
	iconClasses?: readonly string[];
	iconPath?: { dark: URI; light?: URI };
	/**
	 * Icon class to be assigned to the quick item container
	 * directly.
	 */
	iconClass?: string;
	highlights?: IQuickItemHighlights;
	buttons?: readonly IQuickInputButton[];
	/**
	 * Used when we're in multi-select mode. Renders a disabled checkbox.
	 */
	disabled?: boolean;
}

export interface IQuickItemHighlights {
	label?: IMatch[];
	description?: IMatch[];
}

export interface IQuickPickItemHighlights extends IQuickItemHighlights {
	detail?: IMatch[];
}

/**
 * Represents a button in the quick input UI.
 */
export interface IQuickInputButton {
	/**
	 * The path to the icon for the button.
	 * Either `iconPath` or `iconClass` is required.
	 */
	iconPath?: { dark: URI; light?: URI };
	/**
	 * The CSS class for the icon of the button.
	 * Either `iconPath` or `iconClass` is required.
	 */
	iconClass?: string;
	/**
	 * The tooltip text for the button.
	 */
	tooltip?: string;
	/**
	 * Whether to always show the button.
	 * By default, buttons are only visible when hovering over them with the mouse.
	 */
	alwaysVisible?: boolean;
	/**
	 * Where the button should be rendered. The default is {@link QuickInputButtonLocation.Title}.
	 * @note This property is ignored if the button was added to a QuickPickItem.
	 */
	location?: QuickInputButtonLocation;
	/**
	 * When present, indicates that the button is a toggle button that can be checked or unchecked.
	 * The `checked` property indicates the current state of the toggle and will be updated
	 * when the button is clicked.
	 */
	readonly toggle?: { checked: boolean };
	/**
	 * Optional label for the button. When used with secondary actions, this label appears in the overflow menu.
	 */
	label?: string;
	/**
	 * When true, the button will be rendered as a secondary action in the toolbar overflow menu.
	 * By default, buttons are rendered as primary actions.
	 * @note This does not currently apply to buttons in the Input location
	 */
	secondary?: boolean;
}
declare enum QuickInputButtonLocation {
    /**
     * In the title bar.
     */
    Title = 1,
    /**
     * To the right of the input box.
     */
    Inline = 2,
    /**
     * At the far end inside the input box.
     * Used by the public API to create toggles.
     */
    Input = 3
}
