import type { Options } from "dead-or-alive";
import { deadOrAlive } from "dead-or-alive";
import { runAsWorker } from "synckit";

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
  const { toRegExp } = await importRegExp();
  const deadOrAliveOptions: Options = {
    ...params.deadOrAliveOptions,
    findUrls: false,
    anchorAllowlist: params.deadOrAliveOptions.allowedAnchors
      ? Object.entries(params.deadOrAliveOptions.allowedAnchors).map(
          ([text, url]) => [toRegExp(text), toRegExp(url)] as [RegExp, RegExp],
        )
      : undefined,
  };
  const result = await Promise.all(
    params.urls.map(async (url) => {
      return checkUrl(url, deadOrAliveOptions);
    }),
  );

  return result;
}

/**
 * Import the regular expression utility.
 */
async function importRegExp() {
  try {
    return await import("../utils/regexp.ts");
  } catch {
    // ignore
  }
  try {
    return await import("../utils/regexp.ts");
  } catch {
    // ignore
  }
  // @ts-expect-error -- ignore
  return import("../utils/regexp");
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
