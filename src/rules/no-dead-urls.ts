import { createSyncFn } from "synckit";
import type { Link, Definition, Image } from "mdast";
import { createRule } from "../utils/index.ts";
import type {
  UrlStatus,
  Params as WorkerParams,
} from "../workers/check-url-resource-status-worker.ts";
import { toRegExp } from "../utils/regexp.ts";
import path from "node:path";
import fs from "node:fs";
import { allowedAnchorsToAnchorAllowlist } from "../utils/allowed-anchors-option.ts";

const RE_IS_LOCALHOST =
  /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|::1)(?::\d+)?/u;

const workerPath = import.meta.filename.endsWith(".ts")
  ? path.resolve(
      import.meta.dirname,
      "../workers/check-url-resource-status-worker.ts",
    )
  : path.resolve(import.meta.dirname, "./check-url-resource-status-worker.js");
if (!fs.existsSync(workerPath)) {
  throw new Error(`Worker file not found: ${workerPath}`);
}
const checkUrls =
  createSyncFn<(params: WorkerParams) => UrlStatus[]>(workerPath);

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
    const anchorAllowlist = allowedAnchorsToAnchorAllowlist(
      options?.allowedAnchors ?? { "/./u": "/^:~:/u" },
    );
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
      return URL.parse(url)?.href ?? url;
    }

    return {
      "root:exit"() {
        for (const result of checkUrls({
          urls: [...links.keys()],
          checkUrlsOptions: {
            checkAnchor,
            maxRedirects,
            maxRetries,
            timeout,
          },
        })) {
          if (result.status.type !== "error") continue;
          const error = result.status.error;
          if (error.type === "missing-anchor") {
            const responseUrl = new URL(error.url);
            const baseUrl = responseUrl.origin + responseUrl.pathname;
            if (
              anchorAllowlist.some(
                ([urlRe, fragmentRe]) =>
                  urlRe.test(baseUrl) && fragmentRe.test(error.fragment),
              )
            )
              continue;
          }
          const nodes = links.get(result.url) ?? [];
          for (const node of nodes) {
            if (error.type === "missing-anchor") {
              context.report({
                node,
                messageId: "missingAnchor",
                data: {
                  url: error.url,
                  fragment: error.fragment,
                },
              });
            } else {
              context.report({
                node,
                messageId: "deadLink",
                data: { url: result.url },
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
  const url = URL.parse(urlString);
  if (!url) return urlString;
  url.hash = "";
  return url.href;
}
