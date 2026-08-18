import { readFile, writeFile } from "node:fs/promises";

/**
 * Minimal .env reader/writer for the setup scripts.
 *
 * Deliberately not dotenv: the scripts need to *write* a value back while
 * preserving comments and ordering, which parse-only libraries do not do.
 * Next loads .env.local itself at runtime, so this is build-time tooling only.
 */
const LINE = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;

function unquote(value: string): string {
  const trimmed = value.trim();
  return /^(['"]).*\1$/.test(trimmed) ? trimmed.slice(1, -1) : trimmed;
}

export async function readEnvFile(path: string): Promise<Record<string, string>> {
  const raw = await readFile(path, "utf8").catch(() => "");
  const values: Record<string, string> = {};

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const match = LINE.exec(line);
    if (match?.[1]) values[match[1]] = unquote(match[2] ?? "");
  }

  return values;
}

/**
 * Sets one key, rewriting its line in place if present and appending otherwise.
 * Comments, blank lines, and the order of other keys are preserved.
 */
export async function upsertEnvFile(path: string, key: string, value: string): Promise<void> {
  const raw = await readFile(path, "utf8").catch(() => "");
  const lines = raw ? raw.split(/\r?\n/) : [];
  const index = lines.findIndex((line) => LINE.exec(line)?.[1] === key);
  const entry = `${key}=${value}`;

  if (index >= 0) lines[index] = entry;
  else {
    if (lines.length > 0 && lines.at(-1) !== "") lines.push("");
    lines.push(entry);
  }

  await writeFile(path, `${lines.join("\n").replace(/\n+$/, "")}\n`);
}
