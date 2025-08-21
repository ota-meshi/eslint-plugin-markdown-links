import { defineConfig } from "tsdown";

export default defineConfig([
  {
    clean: true,
    dts: true,
    outDir: "lib",
    entry: {
      index: "src/index.ts",
      "dead-or-alive-worker": "src/workers/dead-or-alive-worker.ts",
    },
    format: ["esm"],
    treeshake: true,
  },
]);
