import type { Linter } from "eslint";
import { rules } from "../utils/rules.ts";
import base from "./base.ts";

const all: Linter.RulesRecord = {};
for (const rule of rules) {
  all[rule.meta.docs.ruleId] = "error";
}

const config: Linter.Config[] = [
  ...base,
  {
    rules: {
      ...all,
    },
  },
];

export default config;
