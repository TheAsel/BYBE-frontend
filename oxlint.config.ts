import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",

  ignorePatterns: [
    "**/node_modules/",
    "dist/",
    "quasar.config.*.temporary.compiled*",
    ".quasar/",
    "env.d.ts",
    "quasar.config.ts",
    "src-cordova/",
    "src-capacitor/",
    "src/router/typed-router.d.ts"
  ],

  options: {
    typeAware: true,
    typeCheck: true,
    maxWarnings: 10
  },

  plugins: ["typescript", "vue", "import", "eslint", "promise", "unicorn"],

  categories: {
    correctness: "error",
    // style: "error",
    pedantic: "warn",
    suspicious: "error",
    perf: "error",
    restriction: "error"
  },

  rules: {
    complexity: "off",
    "import/max-dependencies": "off",
    "import/no-default-export": "off",
    "max-depth": "off",
    "max-lines": "off",
    "max-lines-per-function": "off",
    "no-console": "off",
    "no-undefined": "off",
    "promise/always-return": ["warn", { ignoreLastCallback: true }],
    "typescript/no-non-null-assertion": "off",
    "typescript/no-unsafe-argument": "off",
    "typescript/no-unsafe-assignment": "off",
    "typescript/no-unsafe-call": "off",
    "typescript/no-unsafe-member-access": "off",
    "typescript/no-unsafe-return": "off",
    "typescript/prefer-readonly-parameter-types": "off",
    "typescript/strict-boolean-expressions": "off"
  },

  env: {
    builtin: true
  }
});
