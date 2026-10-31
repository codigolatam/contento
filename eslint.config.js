import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage", ".venv-docs", "site"] },
  js.configs.recommended,
  {
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ["src/server/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/web/**/*.tsx"],
    ...react.configs.flat.recommended,
    languageOptions: { ...react.configs.flat.recommended.languageOptions, globals: globals.browser },
    settings: { react: { version: "detect" } },
    plugins: { ...react.configs.flat.recommended.plugins, "react-hooks": reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
);
