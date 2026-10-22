import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // The 3D hero (three.js / React Three Fiber) animates by changing camera, light and DOM
  // objects in place on every frame, through refs shared with the scene. That is how R3F is
  // meant to be used, but the React Compiler rules read it as mutating render values.
  {
    files: ["app/components/TankScene.js", "app/components/TankHero.js"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
