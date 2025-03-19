import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {},
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app"),
    },
  },
});
