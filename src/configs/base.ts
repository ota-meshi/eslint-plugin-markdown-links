import markdown from "@eslint/markdown";
import type { ESLint, Linter } from "eslint";
import plugin from "../index.ts";

export default [
  {
    plugins: {
      markdown: markdown as ESLint.Plugin,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- ignore
      get "markdown-links"(): ESLint.Plugin {
        return plugin;
      },
    },
  },
  {
    files: ["*.md", "**/*.md"],
    language: "markdown/gfm",
    languageOptions: { frontmatter: "yaml" },
  },
] satisfies Linter.Config[];
