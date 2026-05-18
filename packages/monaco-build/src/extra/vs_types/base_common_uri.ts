/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See ./LICENSE
 *--------------------------------------------------------------------------------------------*/
// https://github.com/microsoft/vscode/blob/main/src/vs/base/common/uri.ts
/**
 * Uniform Resource Identifier (Uri) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 */
export interface URI extends UriComponents {
	/**
	 * scheme is the 'http' part of 'http://www.example.com/some/path?query#fragment'.
	 * The part before the first colon.
	 */
	readonly scheme: string;
	/**
	 * authority is the 'www.example.com' part of 'http://www.example.com/some/path?query#fragment'.
	 * The part between the first double slashes and the next slash.
	 */
	readonly authority: string;
	/**
	 * path is the '/some/path' part of 'http://www.example.com/some/path?query#fragment'.
	 */
	readonly path: string;
	/**
	 * query is the 'query' part of 'http://www.example.com/some/path?query#fragment'.
	 */
	readonly query: string;
	/**
	 * fragment is the 'fragment' part of 'http://www.example.com/some/path?query#fragment'.
	 */
	readonly fragment: string;
	/**
	 * Returns a string representing the corresponding file system path of this Uri.
	 * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
	 * platform specific path separator.
	 *
	 * * Will *not* validate the path for invalid characters and semantics.
	 * * Will *not* look at the scheme of this Uri.
	 * * The result shall *not* be used for display purposes but for accessing a file on disk.
	 *
	 *
	 * The *difference* to `Uri#path` is the use of the platform specific separator and the handling
	 * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
	 *
	 * ```ts
		const u = Uri.parse('file://server/c$/folder/file.txt')
		u.authority === 'server'
		u.path === '/shares/c$/file.txt'
		u.fsPath === '\\server\c$\folder\file.txt'
	```
	 *
	 * Using `Uri#path` to read a file (using fs-apis) would not be enough because parts of the path,
	 * namely the server name, would be missing. Therefore `Uri#fsPath` exists - it's sugar to ease working
	 * with URIs that represent files on disk (`file` scheme).
	 */
	get fsPath(): string;
	with(change: {
		scheme?: string;
		authority?: string | null;
		path?: string | null;
		query?: string | null;
		fragment?: string | null;
	}): URI;
	/**
	 * Creates a string representation for this Uri. It's guaranteed that calling
	 * `Uri.parse` with the result of this function creates an Uri which is equal
	 * to this Uri.
	 *
	 * * The result shall *not* be used for display purposes but for externalization or transport.
	 * * The result will be encoded using the percentage encoding and encoding happens mostly
	 * ignore the scheme-specific encoding rules.
	 *
	 * @param skipEncoding Do not encode the result, default is `false`
	 */
	toString(skipEncoding?: boolean): string;
	toJSON(): UriComponents;
}

export interface UriComponents {
	scheme: string;
	authority?: string;
	path?: string;
	query?: string;
	fragment?: string;
}
