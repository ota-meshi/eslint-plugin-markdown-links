import markdown from "@eslint/markdown";
import type { ESLint, Linter } from "eslint";
import plugin from "../index.ts";
import { rules as ruleset } from "../utils/rules.ts";

export const name = "markdown-links/all";
export const files = ["*.md", "**/*.md"];
export const language = "markdown/gfm";
export const languageOptions = {
  frontmatter: "yaml",
};
export const plugins = {
  markdown: markdown as ESLint.Plugin,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
  get "markdown-links"(): ESLint.Plugin {
    return plugin;
  },
};
export const rules: Linter.RulesRecord = ruleset.reduce((acc, rule) => {
  acc[rule.meta.docs.ruleId] = "error";
  return acc;
}, Object.create(null));
