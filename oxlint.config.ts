import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",

  ignorePatterns: [
    "**/node_modules/",
    "dist/",
    "quasar.config.*.temporary.compiled*",
    ".quasar/",
    "env.d.ts",
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
    // pedantic: "warn",
    suspicious: "error",
    perf: "error",
    restriction: "error"
  },

  rules: {
    "import/no-default-export": "off",
    "no-console": "off",
    "typescript/no-non-null-assertion": "off",
    "vue/max-props": ["error", { maxProps: 2 }],
    complexity: ["warn", { max: 50 }]
  },

  env: {
    builtin: true
  }
});
