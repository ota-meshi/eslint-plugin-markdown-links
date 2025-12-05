export type FallbackURL = {
  url: string;
  headers: Record<string, string>;
};

/**
 * Get fallback URLs for the given URL.
 */
export function getFallbackUrl(url: URL): FallbackURL[] {
  if (url.protocol !== "https:" && url.protocol !== "http:") return [];
  if (url.hostname === "www.npmtrends.com") {
    const match = /^\/(.*?)\/?$/.exec(url.pathname);
    if (!match) return [];
    const packageNames = match[1].split("-vs-");
    return packageNames.map(npmRegistryFallbackUrl);
  }
  if (url.hostname === "www.npmjs.com") {
    const match = /^\/package\/(.*?)\/?$/.exec(url.pathname);
    if (!match) return [];
    const packageName = match[1];
    return [npmRegistryFallbackUrl(packageName)];
  }

  return [];
}

/**
 * Get npm registry fallback URL.
 */
function npmRegistryFallbackUrl(packageName: string): FallbackURL {
  return {
    url: `https://registry.npmjs.org/${packageName}`,
    headers: {
      accept:
        "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
    },
  };
}
