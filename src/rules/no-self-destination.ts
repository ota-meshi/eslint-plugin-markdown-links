import { createRule } from "../utils/index.ts";
import type { Link, Image, Definition } from "mdast";
import path from "node:path";

export default createRule("no-self-destination", {
  meta: {
    type: "problem",
    docs: {
      description: "disallow redundant self-destination links",
      categories: ["recommended"],
      listCategory: "Markdown Link",
    },
    fixable: undefined,
    hasSuggestions: false,
    schema: [],
    messages: {
      redundantSelfDestination:
        "Redundant self-destination link '{{url}}'. Use '{{suggestion}}' instead.",
    },
  },
  create(context) {
    const filename = path.isAbsolute(context.physicalFilename)
      ? context.physicalFilename
      : path.resolve(context.cwd, context.physicalFilename);
    const basename = path.basename(filename);

    /**
     * Checks if a URL refers to the current file
     */
    function isSelfDestination(url: string): boolean {
      // Skip external URLs, protocols, fragments only, and empty URLs
      if (!url || /^(?:[a-z]+:|\/\/)/iu.test(url) || url.startsWith("#")) {
        return false;
      }

      // Extract the path part (before # or ?)
      const [pathPart] = url.split(/[#?]/u);
      if (!pathPart) {
        return false;
      }

      // Normalize the path
      let targetPath = pathPart;

      // Handle relative paths - resolve them relative to current file
      if (targetPath.startsWith("./")) {
        targetPath = targetPath.substring(2);
      }
      
      if (targetPath.startsWith("../")) {
        // Resolve the relative path to check if it points to the current file
        const currentDir = path.dirname(filename);
        const resolvedPath = path.resolve(currentDir, targetPath);

        // Check if resolved path is exactly the current file
        return resolvedPath === filename;
      }

      // Check if the target path matches the current file
      // Handle both with and without extension
      const baseWithoutExt = path.parse(basename).name;
      const targetWithoutExt = path.parse(targetPath).name;

      return (
        targetPath === basename ||
        (targetWithoutExt === baseWithoutExt && !targetPath.includes("."))
      );
    }

    /**
     * Get the suggested replacement URL
     */
    function getSuggestion(url: string): string {
      const hashIndex = url.indexOf("#");
      if (hashIndex >= 0) {
        return url.substring(hashIndex);
      }
      const questionIndex = url.indexOf("?");
      if (questionIndex >= 0) {
        return url.substring(questionIndex);
      }
      return "#";
    }

    /**
     * Check a link, image, or definition node
     */
    function check(node: Link | Image | Definition) {
      const url = node.url;
      if (!url || !isSelfDestination(url)) {
        return;
      }

      const suggestion = getSuggestion(url);

      context.report({
        node,
        messageId: "redundantSelfDestination",
        data: {
          url,
          suggestion,
        },
      });
    }

    return {
      link: check,
      image: check,
      definition: check,
    };
  },
});
