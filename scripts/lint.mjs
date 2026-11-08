// Minimal lint: syntax-check every .mjs file and forbid console.log in src/.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
const dirs = ["src", "scripts", "mock", "test"];
let bad = 0;
for (const d of dirs) for (const f of readdirSync(d).filter((f) => f.endsWith(".mjs"))) {
  const p = `${d}/${f}`;
  try { execFileSync(process.execPath, ["--check", p], { stdio: "pipe" }); }
  catch (e) { console.error(`syntax error in ${p}\n${e.stderr}`); bad++; }
  if (d === "src" && /console\.log/.test(readFileSync(p, "utf8"))) { console.error(`console.log in ${p}`); bad++; }
}
if (bad) process.exit(1);
console.log("lint ok");
