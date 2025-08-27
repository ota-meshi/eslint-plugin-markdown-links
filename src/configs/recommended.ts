// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { ESLint, Linter } from "eslint";
import plugin from "../index.ts";
import markdown from "@eslint/markdown";
export const name = "markdown-links/recommended";
export const files = ["*.md", "**/*.md"];
export const language = "markdown/gfm";
export const languageOptions = {
  frontmatter: "yaml",
};
export const plugins = {
  markdown,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
  get "markdown-links"(): ESLint.Plugin {
    return plugin;
  },
};
export const rules: Linter.RulesRecord = {
  // eslint-plugin-markdown-links rules
  "markdown-links/no-missing-fragments": "error",
  "markdown-links/no-missing-path": "error",
};
