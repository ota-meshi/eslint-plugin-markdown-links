import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { rules } from "./lib/load-rules.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const FLAT_RULESET_NAME = {
  recommended: "../src/configs/recommended.ts",
};

for (const rec of ["recommended"] as const) {
  const content = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
import type { Linter } from "eslint";
import base from "./base.ts";

const ruleset: Linter.RulesRecord = {
  // eslint-plugin-markdown-links rules
  ${rules
    .filter(
      (rule) =>
        rule.meta.docs.categories &&
        !rule.meta.deprecated &&
        rule.meta.docs.categories.includes(rec),
    )
    .map((rule) => {
      const conf = rule.meta.docs.default || "error";
      return `"${rule.meta.docs.ruleId}": "${conf}"`;
    })
    .join(",\n")}
};

const config: Linter.Config[] = [
  ...base,
  {
    rules: {
      ...ruleset,
    },
  },
];

export default config;`;

  const filePath = path.resolve(dirname, FLAT_RULESET_NAME[rec]);

  // Update file.
  fs.writeFileSync(filePath, content);
}
