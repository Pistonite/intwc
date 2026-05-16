/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { ThemeIcon } from "./base_common_themables.ts";
import type { URI } from "./base_common_uri.ts";
import type { ICommandMetadata } from "./platform_commands.ts";
import type { ContextKeyExpression } from "./platform_contextkey.ts";


// https://github.com/microsoft/vscode/blob/main/src/vs/platform/actions/common/actions.ts
export interface IMenuItem {
	command: ICommandAction;
	alt?: ICommandAction;
	/**
	 * Menu item is hidden if this expression returns false.
	 */
	when?: ContextKeyExpression;
	group?: 'navigation' | string;
	order?: number;
	isHiddenByDefault?: boolean;
}

export interface ISubmenuItem {
	title: string | ICommandActionTitle;
	submenu: MenuId;
	icon?: Icon;
	when?: ContextKeyExpression;
	group?: 'navigation' | string;
	order?: number;
	isSelection?: boolean;
	/**
	 * A split button shows the first action
	 * as primary action and the rest of the
	 * actions in a dropdown.
	 *
	 * Use `togglePrimaryAction` to promote
	 * the action that was last used to be
	 * the primary action and remember that
	 * choice.
	 */
	isSplitButton?: boolean | {
		/**
		 * Will update the primary action based
		 * on the action that was last run.
		 */
		togglePrimaryAction: true;
	};
}

// https://github.com/microsoft/vscode/blob/main/src/vs/platform/action/common/action.ts
export interface ICommandActionTitle extends ILocalizedString {

	/**
	 * The title with a mnemonic designation. && precedes the mnemonic.
	 */
	mnemonicTitle?: string;
}

export interface ILocalizedString {

	/**
	 * The localized value of the string.
	 */
	value: string;

	/**
	 * The original (non localized value of the string)
	 */
	original: string;
}

export interface ICommandAction {
	id: string;
	title: string | ICommandActionTitle;
	shortTitle?: string | ICommandActionTitle;
	/**
	 * Metadata about this command, used for:
	 * - API commands
	 * - when showing keybindings that have no other UX
	 * - when searching for commands in the Command Palette
	 */
	metadata?: ICommandMetadata;
    // -- intwc:patch -- typeof Categories -> IActionCommonCategories
	category?: keyof IActionCommonCategories | ILocalizedString | string;
	tooltip?: string | ILocalizedString;
	icon?: Icon;
	source?: ICommandActionSource;
	/**
	 * Precondition controls enablement (for example for a menu item, show
	 * it in grey or for a command, do not allow to invoke it)
	 */
	precondition?: ContextKeyExpression;

	/**
	 * The action is a toggle action. Define the context key expression that reflects its toggle-state
	 * or define toggle-info including an icon and a title that goes well with a checkmark.
	 */
	toggled?: ContextKeyExpression | ICommandActionToggleInfo;
}

export interface ICommandActionSource {
	readonly id: string;
	readonly title: string;
}

export interface ICommandActionToggleInfo {

	/**
	 * The condition that marks the action as toggled.
	 */
	condition: ContextKeyExpression;

	icon?: Icon;

	tooltip?: string;

	/**
	 * The title that goes well with a a check mark, e.g "(check) Line Numbers" vs "Toggle Line Numbers"
	 */
	title?: string;

	/**
	 * Like title but with a mnemonic designation.
	 */
	mnemonicTitle?: string;
}

export type Icon = { dark?: URI; light?: URI } | ThemeIcon;
export interface MenuId {
    readonly id: string;
}

// https://github.com/microsoft/vscode/blob/main/src/vs/platform/action/common/actionCommonCategories.ts
export interface IActionCommonCategories {
    View: string,
    Help: string,
    Test: string,
    File: string,
    Preferences: string,
    Developer: string
}
