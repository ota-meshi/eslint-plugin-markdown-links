// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { RuleModule } from "../types.ts";
import noDeadUrls from "../rules/no-dead-urls.ts";
import noMissingFragments from "../rules/no-missing-fragments.ts";
import noMissingPath from "../rules/no-missing-path.ts";

export const rules = [
  noDeadUrls,
  noMissingFragments,
  noMissingPath,
] as RuleModule[];
