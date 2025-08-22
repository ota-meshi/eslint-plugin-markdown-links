import { defineConfig } from "eslint/config";
// import markdown from "@eslint/markdown";
import markdownLinks from "eslint-plugin-markdown-links";
const ruleEntries = Object.entries(markdownLinks.rules).filter(
  ([, rule]) => !rule.meta.deprecated,
);
export default defineConfig([
  // add more generic rule sets here, such as:
  // markdown.configs.recommended,
  markdownLinks.configs.recommended,
  {
    rules: {
      // Add all "eslint-plugin-markdown-links" rules
      ...Object.fromEntries(
        ruleEntries.map(([name, rule]) => [`markdown-links/${name}`, "error"]),
      ),
      // override/add rules settings here, such as:
      "markdown-links/no-dead-urls": "error",
    },
  },
]);
