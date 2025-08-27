import { createRule } from "../utils/index.ts";
import type {
  Definition,
  Heading,
  Html,
  Link,
  Code,
  InlineCode,
  Text,
} from "mdast";
import { iterateAttrs, iterateHTMLTokens } from "../utils/html.ts";
import type { Slugify } from "../utils/slug.ts";
import { createSlugify } from "../utils/slug.ts";

type RawFragmentMdHeading = { type: "md-heading"; value: string };
type RawFragmentHTMLId = { type: "id"; value: string };

type RawFragment = RawFragmentMdHeading | RawFragmentHTMLId;

/**
 * Parse HTML to extract IDs.
 */
function* parseHtmlToExtractIdValues(code: string): Iterable<string> {
  for (const tarOrText of iterateHTMLTokens(code)) {
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
      ignoreCase?: boolean;
      slugify?: "github" | "mdit-vue";
    }?,
  ]
>("no-missing-fragments", {
  meta: {
    type: "problem",
    docs: {
      description:
        "disallow missing fragment identifiers in same-file Markdown links",
      categories: ["recommended"],
      listCategory: "Markdown Link",
    },
    fixable: undefined,
    hasSuggestions: false,
    schema: [
      {
        type: "object",
        properties: {
          ignoreCase: {
            type: "boolean",
          },
          slugify: {
            enum: ["github", "mdit-vue"],
          },
        },
      },
    ],
    messages: {
      missingFragment:
        "The fragment '{{fragment}}' is not defined in this file.",
    },
  },
  create(context) {
    const options = context.options[0];
    const ignoreCase = options?.ignoreCase ?? true;
    const slugifyOption = options?.slugify ?? "github";

    // Store fragments and links during AST traversal
    const availableRawFragments: RawFragment[] = [];
    const linksToCheck: (Link | Definition)[] = [];

    type HeadingStack = {
      node: Heading;
      text: string;
      upper: HeadingStack | null;
    };
    let headingStack: HeadingStack | null;

    /**
     * Check if the fragments in the given nodes exist.
     */
    function checkFragments(nodes: (Link | Definition)[]) {
      if (!nodes.length) return;
      let slugify: Slugify | null = null;
      const availableFragments = new Set<string>(
        availableRawFragments
          .map((raw) => {
            if (raw.type === "md-heading") {
              slugify ??= createSlugify(slugifyOption);
              return slugify(raw.value);
            }
            return raw.value; // type === 'id'
          })
          .map((fragment) => (ignoreCase ? fragment.toLowerCase() : fragment)),
      );
      for (const node of nodes) {
        const url = node.url;
        const fragment = url.slice(1); // Remove the # prefix
        if (!fragment) continue; // Empty fragment

        const normalizedFragment = ignoreCase
          ? fragment.toLowerCase()
          : fragment;
        if (availableFragments.has(normalizedFragment)) continue;

        context.report({
          node,
          messageId: "missingFragment",
          data: { fragment },
        });
      }
    }

    return {
      // Use specific node selectors for Markdown
      heading(node: Heading) {
        headingStack = { node, text: "", upper: headingStack };
      },
      "code, inlineCode, text"(node: Code | InlineCode | Text) {
        if (headingStack) headingStack.text += node.value;
      },
      "heading:exit"(node) {
        if (headingStack?.node !== node) return;

        const match = /\{#([^\s}]+)\}\s*$/u.exec(headingStack.text);
        const textOrId = match?.[1] ?? headingStack.text;

        availableRawFragments.push({ type: "md-heading", value: textOrId });
        headingStack = headingStack.upper;
      },

      html(node: Html) {
        for (const id of parseHtmlToExtractIdValues(node.value.trim())) {
          availableRawFragments.push({ type: "id", value: id });
        }
      },

      // Store links to check later
      "link, definition"(node: Link | Definition) {
        if (node.url.startsWith("#")) linksToCheck.push(node);
      },

      // Check all stored links after all nodes have been processed
      "root:exit"() {
        checkFragments(linksToCheck);
      },
    };
  },
});
