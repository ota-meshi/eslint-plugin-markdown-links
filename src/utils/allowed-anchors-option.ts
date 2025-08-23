import { toRegExp } from "./regexp.ts";

export type AllowedAnchors = Record<string, string>;
export type AnchorAllowlist = readonly Readonly<
  [url: RegExp, anchor: RegExp]
>[];

export function allowedAnchorsToAnchorAllowlist(
  allowedAnchors: AllowedAnchors,
): AnchorAllowlist;
export function allowedAnchorsToAnchorAllowlist(
  allowedAnchors: AllowedAnchors | null | undefined,
): AnchorAllowlist | undefined;
/**
 * Converts an object of allowed anchors to an array of anchor allowlist entries.
 */
export function allowedAnchorsToAnchorAllowlist(
  allowedAnchors: AllowedAnchors | null | undefined,
): AnchorAllowlist | undefined {
  if (!allowedAnchors) return undefined;
  return Object.entries(allowedAnchors).map(([url, anchor]) => [
    toRegExp(url),
    toRegExp(anchor),
  ]);
}
