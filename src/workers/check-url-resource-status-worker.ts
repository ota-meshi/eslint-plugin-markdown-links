import type { Options, Result } from "./lib/check-url-resource-status.ts";
import { checkUrlResourceStatus } from "./lib/check-url-resource-status.ts";
import { runAsWorker } from "synckit";
import { getCached, writeCache } from "./lib/cache.ts";

export type Params = {
  urls: string[];
  checkUrlsOptions: Options;
};

export type UrlStatus = {
  url: string;
  status: Result | { type: "ignored" };
};

runAsWorker(checkUrls);

/**
 * Check if the given URLs are alive or not.
 */
async function checkUrls(params: Params): Promise<UrlStatus[]> {
  const checkUrlsOptions: Options = params.checkUrlsOptions;
  const result = await Promise.all(
    params.urls.map(async (url) => {
      return checkUrlWithCache(url, checkUrlsOptions);
    }),
  );

  return result;
}

/**
 * Check if the given URL is alive.
 */
async function checkUrlWithCache(
  url: string,
  checkUrlsOptions: Options,
): Promise<UrlStatus> {
  const cached = await getCached(url, checkUrlsOptions);

  if (cached) {
    return cached;
  }

  const result = await checkUrl(url, checkUrlsOptions);

  if (result.status.type !== "ignored") {
    await writeCache(url, checkUrlsOptions, result);
  }

  return result;
}

/**
 * Check if the given URL is alive.
 */
async function checkUrl(
  url: string,
  checkUrlsOptions: Options,
): Promise<UrlStatus> {
  if (!url.startsWith("http")) {
    return { url, status: { type: "ignored" } };
  }
  return {
    url,
    status: await checkUrlResourceStatus(new URL(url), checkUrlsOptions),
  };
}
