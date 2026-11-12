// Compatibility entry for the Vercel Root Directory configured before the rename.
// Source of truth: ../bruto-hamburgueria. Generated copies are never committed.
const fs = require("node:fs");
const path = require("node:path");
const source = path.resolve(__dirname, "../bruto-hamburgueria");
for (const name of ["src", "public", "next.config.ts", "postcss.config.mjs", "tsconfig.json", "eslint.config.mjs"]) {
  const from = path.join(source, name);
  if (!fs.existsSync(from)) throw new Error(`Missing canonical BRUTO source: ${from}`);
  fs.cpSync(from, path.join(__dirname, name), { recursive: true, force: true });
}
console.log("BRUTO source prepared from bruto-hamburgueria.");
