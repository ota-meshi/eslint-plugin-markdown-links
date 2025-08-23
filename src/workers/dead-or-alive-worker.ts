import type { Options } from "dead-or-alive";
import { deadOrAlive } from "dead-or-alive";
import { runAsWorker } from "synckit";
import { getCached, writeCache } from "./lib/cache.ts";
import { allowedAnchorsToAnchorAllowlist } from "../utils/allowed-anchors-option.ts";

export type SerializableOptions = Omit<Options, "anchorAllowlist"> & {
  allowedAnchors: Record<string, string>;
};

export type Result = UrlStatus[];

export type Params = {
  urls: string[];
  deadOrAliveOptions: SerializableOptions;
};

export type UrlStatus = {
  url: string;
  status: "alive" | "dead" | "ignored";
  message?: string;
  missingAnchor?: boolean;
};

runAsWorker(checkUrls);

/**
 * Check if the given URLs are alive or not.
 */
async function checkUrls(params: Params): Promise<Result> {
  const deadOrAliveOptions: Options = {
    ...params.deadOrAliveOptions,
    findUrls: false,
    anchorAllowlist: allowedAnchorsToAnchorAllowlist(
      params.deadOrAliveOptions.allowedAnchors,
    ),
  };
  const result = await Promise.all(
    params.urls.map(async (url) => {
      return checkUrlWithCache(url, deadOrAliveOptions);
    }),
  );

  return result;
}

/**
 * Check if the given URL is alive.
 */
async function checkUrlWithCache(
  url: string,
  deadOrAliveOptions: Options,
): Promise<UrlStatus> {
  const cached = await getCached(url, deadOrAliveOptions);

  if (cached) {
    return cached;
  }

  const result = await checkUrl(url, deadOrAliveOptions);

  if (result.status !== "ignored") {
    await writeCache(url, deadOrAliveOptions, result);
  }

  return result;
}

/**
 * Check if the given URL is alive.
 */
async function checkUrl(
  url: string,
  deadOrAliveOptions: Options,
): Promise<UrlStatus> {
  if (!url.startsWith("http")) {
    return { url, status: "ignored" };
  }

  const result = await deadOrAlive(new URL(url), deadOrAliveOptions);

  if (result.status === "alive") {
    return { url, status: "alive" };
  }

  const m = result.messages[0];

  return {
    url,
    status: "dead",
    message: m?.message,
    missingAnchor: m?.ruleId === "missing-anchor",
  };
}
