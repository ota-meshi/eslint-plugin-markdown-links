import { createRule } from "../utils/index.ts";
import type { Link, Image, Definition, Heading, Root } from "mdast";
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { toRegExp } from "../utils/regexp.ts";
import { allowedAnchorsToAnchorAllowlist } from "../utils/allowed-anchors-option.ts";
import { parseMarkdown } from "../utils/markdown-parser/parser.ts";
import { traverse } from "../utils/ast.ts";
import { iterateAttrs, iterateTagAndText } from "../utils/html.ts";
import { LRUCache } from "../utils/lru-cache.ts";

type AnchorOption = {
  ignoreCase: boolean;
};

const RE_EXTERNAL_URL = /^(?:[a-z]+:|\/\/)/iu;
const RE_GITHUB_LINE_REFERENCE_FRAGMENT = /^L\d+(?:C\d+)?(?:-L\d+(?:C\d+)?)?$/u;

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

const cacheMDFragments = new LRUCache<string, Fragments>({
  max: 10,
  ttl: 1000 * 60,
});

interface Fragments {
  hasFragment(fragment: string, options: { ignoreCase: boolean }): boolean;
}

const anyFragments: Fragments = {
  hasFragment() {
    return true;
  },
};

abstract class AbsFragments implements Fragments {
  private readonly extractedFragments: Set<string> = new Set();

  private readonly fragmentsIterator: Iterator<string>;

  private iteratorFinished = false;

  protected constructor(fragments: Iterable<string>) {
    this.fragmentsIterator = fragments[Symbol.iterator]();
  }

  public hasFragment(
    fragment: string,
    options: { ignoreCase: boolean },
  ): boolean {
    const fragmentToCheck = options.ignoreCase
      ? fragment.toLowerCase()
      : fragment;

    for (const fragmentInFile of this.extractedFragments) {
      if (
        (options.ignoreCase ? fragmentInFile.toLowerCase() : fragmentInFile) ===
        fragmentToCheck
      ) {
        return true;
      }
    }

    if (this.iteratorFinished) return false;

    let data: IteratorResult<string>;
    while ((data = this.fragmentsIterator.next())) {
      if (data.done) {
        this.iteratorFinished = true;
        break;
      }
      const fragmentInFile = data.value;
      this.extractedFragments.add(fragmentInFile);
      if (
        (options.ignoreCase ? fragmentInFile.toLowerCase() : fragmentInFile) ===
        fragmentToCheck
      ) {
        return true;
      }
    }

    return false;
  }
}

class MDFragments extends AbsFragments {
  public constructor(ast: Root) {
    const slugger = new GithubSlugger();
    type HeadingStack = {
      node: Heading;
      text: string;
      upper: HeadingStack | null;
    };
    let headingStack: HeadingStack | null;
    super(
      traverse(ast, {
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
      }),
    );
  }
}

class HTMLFragments extends AbsFragments {
  public constructor(html: string) {
    super(parseHtmlToExtractIdValues(html));
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
      notFileButLinkHasFragment:
        "The file '{{path}}' is not a regular file, but the link has a fragment '{{fragment}}'.",
    },
  },
  create(context) {
    if (context.filename === context.physicalFilename) {
      cacheMDFragments.set(
        context.filename,
        new MDFragments(context.sourceCode.ast),
      );
    }

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
     * Strips the fragment from a link URL.
     */
    function stripFragment(linkUrl: string): string {
      const [fileUrl] = linkUrl.split(/([#?])/u);
      return fileUrl;
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
      if (
        !url ||
        isExternal(url) ||
        url.startsWith("#") ||
        isIgnore(stripFragment(url))
      )
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
      reportNode: Link | Image | Definition,
      resolved: LinkPathWithFragment,
    ) {
      if (RE_GITHUB_LINE_REFERENCE_FRAGMENT.test(resolved.fragment)) return;
      if (
        anchorAllowlist.some(([url, anchor]) => {
          return (
            url.test(resolved.relativePath) && anchor.test(resolved.fragment)
          );
        })
      )
        return;

      let fragments: Fragments | undefined = cacheMDFragments.get(
        resolved.fullPath,
      );
      if (!fragments) {
        const stat = fs.statSync(resolved.fullPath);
        if (!stat.isFile()) {
          context.report({
            node: reportNode,
            messageId: "notFileButLinkHasFragment",
            data: { fragment: resolved.fragment, path: resolved.relativePath },
          });
          return;
        }
        fragments = createFragments(resolved.fullPath);
        cacheMDFragments.set(resolved.fullPath, fragments);
      }

      if (
        fragments.hasFragment(resolved.fragment, {
          ignoreCase: anchorOption.ignoreCase,
        })
      ) {
        return;
      }

      context.report({
        node: reportNode,
        messageId: "missingAnchor",
        data: { fragment: resolved.fragment, path: resolved.relativePath },
      });
    }

    return {
      link: check,
      image: check,
      definition: check,
    };

    /**
     * Creates a new Fragments instance for the given file.
     */
    function createFragments(filePath: string): Fragments {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".md" || ext === ".markdown") {
        const ast = parseMarkdown(filePath, context.languageOptions);
        if (!ast) return anyFragments;
        return new MDFragments(ast);
      }
      if (ext === ".html") {
        // Support HTML as well, considering cases such as HTML generated by static site generators
        return new HTMLFragments(fs.readFileSync(filePath, "utf-8"));
      }

      return anyFragments;
    }
  },
});
