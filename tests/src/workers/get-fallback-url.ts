import assert from "assert";
import { getFallbackUrl } from "../../../src/workers/lib/get-fallback-url.ts";

describe("getFallbackUrl", () => {
  const npmAcceptHeader =
    "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";

  const npmUrls = [
    "https://www.npmjs.com/package/eslint",
    "https://npmjs.com/package/eslint",
    "https://www.npmjs.com/eslint",
    "https://npmjs.com/eslint",
  ];

  for (const url of npmUrls) {
    it(`returns npm registry fallback for ${url}`, () => {
      assert.deepStrictEqual(getFallbackUrl(new URL(url)), [
        {
          url: "https://registry.npmjs.org/eslint",
          headers: {
            accept: npmAcceptHeader,
          },
        },
      ]);
    });
  }

  it("handles scoped packages without /package", () => {
    assert.deepStrictEqual(
      getFallbackUrl(new URL("https://npmjs.com/@eslint/js")),
      [
        {
          url: "https://registry.npmjs.org/@eslint/js",
          headers: {
            accept: npmAcceptHeader,
          },
        },
      ],
    );
  });
});
