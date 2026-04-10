// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { Linter } from "eslint";
import base from "./base.ts";

const ruleset: Linter.RulesRecord = {
  // eslint-plugin-markdown-links rules
  "markdown-links/no-missing-path": "error",
  "markdown-links/no-self-destination": "error",
};

const config: Linter.Config[] = [
  ...base,
  {
    rules: {
      ...ruleset,
    },
  },
];

export default config;
