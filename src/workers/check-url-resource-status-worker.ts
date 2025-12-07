import type { Options, Result } from "./lib/check-url-resource-status.ts";
import { checkUrlResourceStatus } from "./lib/check-url-resource-status.ts";
import { runAsWorker } from "synckit";
import { getCached, writeCache } from "./lib/cache.ts";
import { getFallbackUrl } from "./lib/get-fallback-url.ts";
import { DomainRateLimiter } from "./lib/rate-limiter.ts";

let rateLimiter: DomainRateLimiter | null = null;

export type Params = {
  urls: string[];
  checkUrlsOptions: Options;
};

export type UrlStatus = {
  url: string;
  status: Result | { type: "ignored" } | { type: "fallback"; urls: string[] };
};

runAsWorker(checkUrls);

/**
 * Check if the given URLs are alive or not.
 */
async function checkUrls(params: Params): Promise<UrlStatus[]> {
  const checkUrlsOptions: Options = params.checkUrlsOptions;

  // Initialize rate limiter if needed
  if (
    checkUrlsOptions.rateLimitPerDomain &&
    checkUrlsOptions.rateLimitPerDomain > 0
  ) {
    rateLimiter = new DomainRateLimiter(checkUrlsOptions.rateLimitPerDomain);
  } else {
    rateLimiter = null;
  }

  const results = await Promise.all(
    params.urls.map(
      async (urlStr): Promise<UrlStatus> =>
        (await checkFallbackUrl(urlStr, checkUrlsOptions)) ||
        (await checkUrlWithCache(urlStr, checkUrlsOptions)),
    ),
  );

  return results;
}

/**
 * Check if the fallback URL is alive.
 */
async function checkFallbackUrl(
  urlStr: string,
  checkUrlsOptions: Options,
): Promise<UrlStatus | null> {
  const url = new URL(urlStr);
  const fallbackUrls = getFallbackUrl(url);
  if (!fallbackUrls.length) return null;

  const fallbackResult = await Promise.all(
    fallbackUrls.map((u) =>
      checkUrlWithCache(u.url, checkUrlsOptions, u.headers),
    ),
  );

  if (fallbackResult.some((r) => r.status.type === "error")) return null;
  return {
    url: urlStr,
    status: {
      type: "fallback",
      urls: fallbackUrls.map((u) => u.url),
    },
  };
}

/**
 * Check if the given URL is alive.
 */
async function checkUrlWithCache(
  url: string,
  checkUrlsOptions: Options,
  headers?: Record<string, string> | null,
): Promise<UrlStatus> {
  const cached = await getCached(url, checkUrlsOptions);

  if (cached) {
    return cached;
  }

  const result = await checkUrl(url, checkUrlsOptions, headers);

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
  headers: Record<string, string> | null | undefined,
): Promise<UrlStatus> {
  if (!url.startsWith("http")) {
    return { url, status: { type: "ignored" } };
  }

  const urlObj = new URL(url);
  const domain = urlObj.hostname;

  // Use rate limiter if enabled
  if (rateLimiter) {
    const status = await rateLimiter.execute(domain, () =>
      checkUrlResourceStatus(urlObj, headers, checkUrlsOptions),
    );
    return { url, status };
  }

  return {
    url,
    status: await checkUrlResourceStatus(urlObj, headers, checkUrlsOptions),
  };
}
