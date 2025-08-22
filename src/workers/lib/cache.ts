import path from "node:path";
import fs from "node:fs";
import type { UrlStatus } from "../dead-or-alive-worker.ts";
import type { Options } from "dead-or-alive";
import sdbm from "sdbm";

const TTL_FOR_ALIVE = 1000 * 60 * 60 * 24; // 1day
const TTL_FOR_DEAD = 1000 * 60; // 1minute

const CACHED_ROOT_PATH = path.join(import.meta.dirname, `../.cached`);

type CachedData = {
  expired?: number;
  status?: UrlStatus;
};

/**
 * Get the cache for a URL.
 */
export async function getCached(
  url: string,
  deadOrAliveOptions: Options,
): Promise<UrlStatus | null> {
  const cachedFilePath = urlToCachedFilePath(url, deadOrAliveOptions);
  if (!cachedFilePath) return null;
  await fs.promises.mkdir(path.dirname(cachedFilePath), { recursive: true });
  const data: CachedData = JSON.parse(
    fs.existsSync(cachedFilePath)
      ? await fs.promises.readFile(cachedFilePath, "utf-8")
      : "{}",
  );

  const alive = Boolean(
    typeof data.expired === "number" && data.expired >= Date.now(),
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
  deadOrAliveOptions: Options,
  status: UrlStatus,
): Promise<void> {
  await fs.promises.mkdir(CACHED_ROOT_PATH, { recursive: true });
  const cachedFilePath = urlToCachedFilePath(url, deadOrAliveOptions);
  if (!cachedFilePath) return;
  await fs.promises.mkdir(path.dirname(cachedFilePath), { recursive: true });
  await fs.promises.writeFile(
    cachedFilePath,
    JSON.stringify({
      expired:
        Date.now() + (status.status === "alive" ? TTL_FOR_ALIVE : TTL_FOR_DEAD),
      status,
    }),
  );
}

/**
 * Get the cached file path for a URL.
 */
function urlToCachedFilePath(
  urlString: string,
  deadOrAliveOptions: Options,
): string | null {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }
  const pathname = url.pathname.split("/").filter(Boolean).join("/");
  return path.join(
    CACHED_ROOT_PATH,
    deadOrAliveOptions.checkAnchor
      ? "check-anchor-enable"
      : "check-anchor-disable",
    url.protocol.replaceAll(":", ""),
    url.host.replaceAll(":", "__c__"),
    sdbm(`${pathname}${url.search}${url.hash}`).toString(36),
    "status.json",
  );
}
