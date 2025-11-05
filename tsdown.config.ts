import { defineConfig } from "tsdown";

export default defineConfig([
  {
    clean: true,
    dts: true,
    outDir: "lib",
    entry: {
      index: "src/index.ts",
      "check-url-resource-status-worker":
        "src/workers/check-url-resource-status-worker.ts",
    },
    format: ["esm"],
    treeshake: true,
    fixedExtension: false,
  },
]);
