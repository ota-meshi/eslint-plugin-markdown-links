import { createRule } from "../utils/index.ts";
import type { Link, Image, Definition, Heading } from "mdast";
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { toRegExp } from "../utils/regexp.ts";
import { allowedAnchorsToAnchorAllowlist } from "../utils/allowed-anchors-option.ts";
import { parseMarkdown } from "../utils/markdown-parser/parser.ts";
import { traverse } from "../utils/ast.ts";
import { iterateAttrs, iterateTagAndText } from "../utils/html.ts";

type AnchorOption = {
  ignoreCase: boolean;
};

const RE_EXTERNAL_URL = /^(?:[a-z]+:|\/\/)/iu;

/**
 * Check if a file path is external (i.e., starts with http(s):// or //).
 */
function isExternal(filePath: string): boolean {
  return RE_EXTERNAL_URL.test(filePath);
}

/**
 * Parse HTML to extract IDs.
 */
function* parseHtmlToExtractIdValues(code: string): Iterable<string> {
  for (const tarOrText of iterateTagAndText(code)) {
    if (tarOrText.type !== "opening-tag") continue;
    for (const attr of iterateAttrs(tarOrText.value)) {
      if (attr.name === "id" && attr.value) {
        yield attr.value;
      }
    }
  }
}

export default createRule<
  [
    {
      basePath?: string;
      ignorePaths?: string[];
      allowedAnchors?: Record<string, string>;
      checkAnchor?: boolean;
      anchorOption?: Partial<AnchorOption>;
    }?,
  ]
>("no-missing-path", {
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow missing local file paths in Markdown links and images",
      categories: ["recommended"],
      listCategory: "Markdown Link",
    },
    fixable: undefined,
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          basePath: {
            type: "string",
          },
          ignorePaths: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
          },
          checkAnchor: {
            type: "boolean",
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
          anchorOption: {
            type: "object",
            properties: {
              ignoreCase: {
                type: "boolean",
              },
            },
          },
        },
      },
    ],
    messages: {
      missingPath:
        "The file '{{path}}' does not exist. Please check the path or update it to a valid file.",
      missingAnchor: "The anchor '{{fragment}}' is not defined in '{{path}}'.",
    },
  },
  create(context) {
    const options = context.options[0];
    const basePath = options?.basePath ?? context.cwd;
    const ignorePaths = options?.ignorePaths?.map((p) => toRegExp(p)) ?? [];
    const anchorAllowlist = allowedAnchorsToAnchorAllowlist(
      options?.allowedAnchors ?? { "/./u": "/^:~:/u" },
    );
    const checkAnchor = options?.checkAnchor ?? true;
    const anchorOption: AnchorOption = {
      ignoreCase: options?.anchorOption?.ignoreCase ?? true,
    };

    const filename = context.physicalFilename;
    const dirname = path.dirname(filename);

    type LinkPathWithFragment = {
      fullPath: string;
      relativePath: string;
      fragment: string;
    };
    type LinkPathWithoutFragment = {
      fullPath: string;
      relativePath: string;
      fragment?: undefined;
    };
    type LinkPathAndFragment = LinkPathWithFragment | LinkPathWithoutFragment;

    /**
     * Checks whether the given file path should be ignored.
     */
    function isIgnore(filePath: string): boolean {
      return ignorePaths.some((pattern) => pattern.test(filePath));
    }

    /**
     * Get the absolute path of a link or image.
     */
    function getLinkFullPath(fileUrl: string): string {
      if (fileUrl.startsWith("/")) {
        // - [a](/foo.md)
        return path.join(basePath, fileUrl.slice(1));
      }
      if (fileUrl.startsWith("./") || fileUrl.startsWith("../")) {
        // - [a](./foo.md)
        return path.join(dirname, fileUrl);
      }

      // - [a](foo.md)
      return path.join(dirname, fileUrl);
    }

    /**
     * Get the path and fragment of a link or image.
     */
    function getLinkPathAndFragment(linkUrl: string): LinkPathAndFragment {
      const [fileUrl, ...suffix] = linkUrl.split(/([#?])/u);
      const hashIndex = suffix.indexOf("#");
      const fullPath = getLinkFullPath(fileUrl);
      return {
        fullPath,
        relativePath: path.relative(basePath, fullPath),
        ...(hashIndex >= 0
          ? {
              fragment: suffix.slice(hashIndex + 1).join(""),
            }
          : {}),
      };
    }

    /**
     * Checks if the link or image node has a valid file path.
     */
    function check(node: Link | Image | Definition) {
      const url = node.url;
      if (!url || isExternal(url) || url.startsWith("#") || isIgnore(url))
        return;
      const resolved = getLinkPathAndFragment(url);
      if (isIgnore(resolved.relativePath)) return;
      if (!fs.existsSync(resolved.fullPath)) {
        context.report({
          node,
          messageId: "missingPath",
          data: { path: url },
        });
        return;
      }
      if (checkAnchor && resolved.fragment) {
        checkForAnchor(node, resolved);
      }
    }

    /**
     * Checks if the link or image node has a valid anchor.
     */
    function checkForAnchor(
      resourceNode: Link | Image | Definition,
      resolved: LinkPathWithFragment,
    ) {
      if (
        anchorAllowlist.some(([url, anchor]) => {
          return (
            url.test(resolved.relativePath) && anchor.test(resolved.fragment)
          );
        })
      )
        return;

      const code = parseMarkdown(resolved.fullPath, context.languageOptions);
      if (!code) return;

      const slugger = new GithubSlugger();
      type HeadingStack = {
        node: Heading;
        text: string;
        upper: HeadingStack | null;
      };
      let headingStack: HeadingStack | null;
      const fragments = traverse(code.ast, {
        *enter(node) {
          if (node.type === "heading") {
            headingStack = { node, text: "", upper: headingStack };
            return;
          }
          if (
            node.type === "code" ||
            node.type === "inlineCode" ||
            node.type === "text"
          ) {
            if (headingStack) headingStack.text += node.value;
            return;
          }
          if (node.type === "html") {
            yield* parseHtmlToExtractIdValues(node.value.trim());
          }
        },
        *exit(node) {
          if (headingStack?.node === node) {
            const match = /\{#([^\s}]+)\}\s*$/u.exec(headingStack.text);
            const textOrId = match?.[1] ?? headingStack.text;
            yield slugger.slug(textOrId);
          }
        },
      });

      const fragmentToCheck = anchorOption.ignoreCase
        ? resolved.fragment.toLowerCase()
        : resolved.fragment;
      if (fragmentToCheck === "a") debugger;

      for (const fragment of fragments) {
        if (
          fragmentToCheck ===
          (anchorOption.ignoreCase ? fragment.toLowerCase() : fragment)
        ) {
          return;
        }
      }

      context.report({
        node: resourceNode,
        messageId: "missingAnchor",
        data: { fragment: resolved.fragment, path: resolved.relativePath },
      });
    }

    return {
      link: check,
      image: check,
      definition: check,
    };
  },
});
