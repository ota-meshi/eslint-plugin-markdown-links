import path from "node:path";
import fs from "node:fs";
import type { Options } from "./check-url-resource-status.ts";
import sdbm from "sdbm";
import { version as VERSION } from "../../meta.ts";
import type { UrlStatus } from "../check-url-resource-status-worker.ts";

const TTL_FOR_SUCCESS = 1000 * 60 * 60 * 24; // 1day
const TTL_FOR_ERROR = 1000 * 60; // 1minute

const CACHED_ROOT_PATH = path.join(import.meta.dirname, `../.cached`);

type CachedData = {
  expired?: number;
  status?: UrlStatus;
  v?: string;
};

/**
 * Get the cache for a URL.
 */
export async function getCached(
  url: string,
  checkUrlsOptions: Options,
): Promise<UrlStatus | null> {
  const cachedFilePath = urlToCachedFilePath(url, checkUrlsOptions);
  if (!cachedFilePath) return null;
  await fs.promises.mkdir(path.dirname(cachedFilePath), { recursive: true });
  const dataText = fs.existsSync(cachedFilePath)
    ? await fs.promises.readFile(cachedFilePath, "utf-8")
    : "{}";
  let data: CachedData = {};
  try {
    data = JSON.parse(dataText);
  } catch {
    // Ignore JSON parse errors
  }

  const alive = Boolean(
    typeof data.expired === "number" &&
    data.expired >= Date.now() &&
    data.v === VERSION,
  );
  if (!alive) {
    return null;
  }

  return data.status || null;
}

/**
 * Write the cache for a URL.
 */
export async function writeCache(
  url: string,
  checkUrlsOptions: Options,
  status: UrlStatus,
): Promise<void> {
  await fs.promises.mkdir(CACHED_ROOT_PATH, { recursive: true });
  const cachedFilePath = urlToCachedFilePath(url, checkUrlsOptions);
  if (!cachedFilePath) return;
  await fs.promises.mkdir(path.dirname(cachedFilePath), { recursive: true });
  await fs.promises.writeFile(
    cachedFilePath,
    JSON.stringify({
      expired:
        Date.now() +
        (status.status.type === "success" ||
        (status.status.type === "error" &&
          status.status.error.type === "missing-anchor")
          ? TTL_FOR_SUCCESS
          : TTL_FOR_ERROR),
      status,
      v: VERSION,
    }),
  );
}

/**
 * Get the cached file path for a URL.
 */
function urlToCachedFilePath(
  urlString: string,
  checkUrlsOptions: Options,
): string | null {
  const url = URL.parse(urlString);
  if (!url) return null;
  const pathname = url.pathname.split("/").filter(Boolean).join("/");
  return path.join(
    CACHED_ROOT_PATH,
    checkUrlsOptions.checkAnchor
      ? "check-anchor-enable"
      : "check-anchor-disable",
    url.protocol.replaceAll(":", ""),
    url.host.replaceAll(":", "__c__"),
    sdbm(`${pathname}${url.search}${url.hash}`).toString(36),
    "status.json",
  );
}
