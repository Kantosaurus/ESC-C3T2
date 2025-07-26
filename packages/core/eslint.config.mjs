// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "**/*.js"],
  },
  ...tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
    languageOptions: {
      globals: {
        URL: "readonly",
      },
      parserOptions: {
        tsconfigRootDir: ".",
      },
    },
  }),
];
