import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function parseEnvFile(filePath: string) {
  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const equalsIndex = normalized.indexOf("=");
    if (equalsIndex < 0) continue;

    const key = normalized.slice(0, equalsIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = normalized.slice(equalsIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(moduleDir, "..", "..");
const searchRoots = new Set([process.cwd(), packageRoot]);

for (const root of searchRoots) {
  for (const candidate of [".env", ".env.local"]) {
    const filePath = resolve(root, candidate);
    if (existsSync(filePath)) {
      parseEnvFile(filePath);
    }
  }
}
