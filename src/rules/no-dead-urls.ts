import { createSyncFn } from "synckit";
import type { Link, Definition, Image } from "mdast";
import { createRule } from "../utils/index.ts";
import type * as doaWorker from "../workers/dead-or-alive-worker.ts";
import { toRegExp } from "../utils/regexp.ts";
import path from "node:path";
import fs from "node:fs";

const RE_IS_LOCALHOST =
  /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|::1)(?::\d+)?/u;

const workerPath = import.meta.filename.endsWith(".ts")
  ? path.resolve(import.meta.dirname, "../workers/dead-or-alive-worker.ts")
  : path.resolve(import.meta.dirname, "./dead-or-alive-worker.js");
if (!fs.existsSync(workerPath)) {
  throw new Error(`Worker file not found: ${workerPath}`);
}
const deadOrAliveUrls =
  createSyncFn<(params: doaWorker.Params) => doaWorker.Result>(workerPath);

export default createRule<
  [
    {
      ignoreLocalhost?: boolean;
      ignoreUrls?: string[];
      allowedAnchors?: Record<string, string>;
      checkAnchor?: boolean;
      maxRedirects?: number;
      maxRetries?: number;
      timeout?: number;
    }?,
  ]
>("no-dead-urls", {
  meta: {
    type: "problem",
    docs: {
      description: "disallow dead external link urls",
      categories: null,
      listCategory: "Markdown Link",
    },
    fixable: undefined,
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          ignoreLocalhost: {
            type: "boolean",
          },
          ignoreUrls: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
          },
          allowedAnchors: {
            type: "object",
            patternProperties: {
              ".*": {
                type: "string",
              },
            },
            additionalProperties: false,
          },
          checkAnchor: {
            type: "boolean",
          },
          maxRedirects: {
            type: "integer",
            minimum: 0,
          },
          maxRetries: {
            type: "integer",
            minimum: 0,
          },
          timeout: {
            type: "integer",
            minimum: 0,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      deadLink:
        "The link '{{url}}' appears to be dead or unreachable. Please check the URL or update it to a working link.",
      missingAnchor:
        "The anchor fragment '{{fragment}}' in '{{url}}' does not exist on the page. Please remove the fragment if unnecessary, or update it to point to an existing element.",
    },
  },
  create(context) {
    const links = new Map<string, (Link | Definition | Image)[]>();
    const options = context.options[0];
    const ignoreLocalhost = options?.ignoreLocalhost ?? true;
    const ignoreUrls = options?.ignoreUrls?.map((url) => toRegExp(url)) ?? [];
    const allowedAnchors = options?.allowedAnchors ?? { "/./u": "/^:~:/u" };
    const checkAnchor = options?.checkAnchor ?? true;
    const maxRedirects = options?.maxRedirects ?? 5;
    const maxRetries = options?.maxRetries ?? 1;
    const timeout = options?.timeout ?? 3000;

    /**
     * Checks whether the given URL should be ignored.
     */
    function isIgnore(url: string): boolean {
      if (ignoreLocalhost && RE_IS_LOCALHOST.test(url)) {
        return true;
      }
      return ignoreUrls.some((pattern) => pattern.test(url));
    }

    /**
     * Normalizes the given URL string.
     */
    function normalizeUrl(url: string) {
      if (!checkAnchor) {
        return removeFragment(url);
      }
      try {
        return new URL(url).href;
      } catch {
        return url;
      }
    }

    return {
      "root:exit"() {
        for (const status of deadOrAliveUrls({
          urls: [...links.keys()],
          deadOrAliveOptions: {
            checkAnchor,
            maxRedirects,
            maxRetries,
            timeout,
            allowedAnchors,
          },
        })) {
          if (status?.status !== "dead") continue;
          const nodes = links.get(status.url) ?? [];
          for (const node of nodes) {
            if (status.missingAnchor) {
              context.report({
                node,
                messageId: "missingAnchor",
                data: {
                  url: removeFragment(status.url),
                  fragment: getFragment(status.url),
                },
              });
            } else {
              context.report({
                node,
                messageId: "deadLink",
                data: { url: status.url },
              });
            }
          }
        }
      },
      "link, definition, image"(node: Link | Definition | Image) {
        const url = node.url;
        if (!url || !url.startsWith("http") || isIgnore(url)) return;
        const normalized = normalizeUrl(url);
        if (isIgnore(normalized)) return;
        const nodes = links.get(normalized) ?? [];
        nodes.push(node);
        links.set(normalized, nodes);
      },
    };
  },
});

/**
 * Removes the fragment identifier from the given URL string.
 */
function removeFragment(urlString: string): string {
  try {
    const url = new URL(urlString);
    url.hash = "";
    return url.href;
  } catch {
    return urlString;
  }
}

/**
 * Gets the fragment identifier from the given URL string.
 */
function getFragment(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.hash.slice(1);
  } catch {
    return "";
  }
}
