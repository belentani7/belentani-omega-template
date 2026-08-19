import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const files = (await readdir(root)).filter((file) => file.endsWith(".html"));
if (files.length === 0) throw new Error("No HTML pages found");

for (const file of files) {
  const html = await readFile(join(root, file), "utf8");
  if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error(`${file}: title is missing`);
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/gi)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|tel:|#|data:|javascript:|\/)/i.test(ref)) continue;
    await access(join(root, ref));
  }
}
console.log(`html-assets: ok (${files.length} pages)`);
