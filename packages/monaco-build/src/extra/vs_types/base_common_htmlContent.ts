/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See ./LICENSE
 *--------------------------------------------------------------------------------------------*/
import type { UriComponents } from "./base_common_uri.ts";
// https://github.com/microsoft/vscode/blob/main/src/vs/base/common/htmlContent.ts
export interface IMarkdownString {
	readonly value: string;
	readonly isTrusted?: boolean | MarkdownStringTrustedOptions;
	readonly supportThemeIcons?: boolean;
	readonly supportHtml?: boolean;
	/** @internal */
	readonly supportAlertSyntax?: boolean;
	readonly baseUri?: UriComponents;
	uris?: { [href: string]: UriComponents };
}
export interface MarkdownStringTrustedOptions {
	readonly enabledCommands: readonly string[];
}
