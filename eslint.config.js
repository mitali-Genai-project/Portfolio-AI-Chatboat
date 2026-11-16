import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".vercel"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022 },
  },
  // Browser app
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
  },
  // Serverless API, server code and tooling
  {
    files: ["api/**/*.ts", "server/**/*.ts", "*.config.{ts,js}"],
    languageOptions: { globals: globals.node },
  },
  // Tests may export helpers / non-components freely
  {
    files: ["**/*.test.{ts,tsx}", "src/test/**"],
    rules: { "react-refresh/only-export-components": "off" },
  },
);
