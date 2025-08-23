import type { MarkdownSourceCode } from "@eslint/markdown";
import markdownPlugin from "@eslint/markdown";
import { VFile } from "./vfile.ts";
import fs from "node:fs";
import type {
  MarkdownLanguageContext,
  MarkdownLanguageOptions,
} from "@eslint/markdown/types";
const gfm = markdownPlugin.languages.gfm;

/**
 * Parses a Markdown file and returns the abstract syntax tree (AST).
 */
export function parseMarkdown(
  filePath: string,
  languageOptions: MarkdownLanguageOptions,
): MarkdownSourceCode | null {
  const context: MarkdownLanguageContext = {
    languageOptions,
  };

  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }

  const vfile = new VFile(filePath, content);
  const result = gfm.parse(vfile, context);
  if (!result.ok) return null;

  return gfm.createSourceCode(vfile, result);
}
