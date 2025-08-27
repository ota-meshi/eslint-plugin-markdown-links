import { SnapshotRuleTester } from "eslint-snapshot-rule-tester";
import rule from "../../../src/rules/no-missing-fragments.js";
import { loadTestCases } from "../../utils/utils.js";

const tester = new SnapshotRuleTester();

tester.run(
  "no-missing-fragments",
  rule as any,
  await loadTestCases("no-missing-fragments"),
);
