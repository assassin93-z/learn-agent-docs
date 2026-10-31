import { lstatSync, readFileSync } from "node:fs";
import { join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, COURSE_PAGES } from "./course-pages.mjs";

function entities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp|middot);/gi, (match, entity) => {
    if (entity.startsWith("#")) {
      const number = entity[1].toLowerCase() === "x" ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      return number <= 0x10ffff ? String.fromCodePoint(number) : match;
    }
    return { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ", middot: "·" }[entity.toLowerCase()] ?? match;
  });
}

function attributes(text) {
  const result = new Map();
  for (const match of text.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) result.set(match[1].toLowerCase(), entities(match[2] ?? match[3]));
  return result;
}

export function parseHtml(html) {
  const links = [];
  const anchors = new Set();
  const visible = html.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/(<(?:script|style)\b[^>]*>)[\s\S]*?<\/(script|style)>/gi, "$1</$2>");
  for (const match of visible.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
    const tag = match[1].toLowerCase();
    const attrs = attributes(match[2]);
    if (attrs.has("id")) anchors.add(attrs.get("id"));
    if (tag === "a" && attrs.has("name")) anchors.add(attrs.get("name"));
    const attribute = ["a", "link"].includes(tag) ? "href" : ["script", "img", "source", "video", "audio"].includes(tag) ? "src" : undefined;
    if (attribute && attrs.has(attribute)) links.push({ href: attrs.get(attribute), tag });
    if (["img", "source"].includes(tag) && attrs.has("srcset") && !attrs.get("srcset").startsWith("data:")) {
      for (const source of attrs.get("srcset").split(",")) links.push({ href: source.trim().split(/\s+/)[0], tag });
    }
  }
  const languageBar = visible.match(/<p\b[^>]*\balign\s*=\s*["']center["'][^>]*>([\s\S]*?)<\/p>/i)?.[1];
  return { links, anchors, languageBar };
}

export function localTarget(href, currentFile, base = BASE) {
  if (!href || href.startsWith("//") || /^(?:https?:|mailto:|tel:|data:image\/)/i.test(href)) return undefined;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) throw new Error("unsupported URL scheme");
  const url = new URL(entities(href), `https://docs.example${base}${currentFile}`);
  const path = decodeURIComponent(url.pathname);
  if (!path.startsWith(base) || path.includes("\0") || path.includes("\\")) throw new Error("local target leaves the site base path");
  let file = path.slice(base.length);
  if (!file || file.endsWith("/")) file += "index.html";
  file = posix.normalize(file);
  if (file === ".." || file.startsWith("../") || file.startsWith("/")) throw new Error("local target leaves the artifact scope");
  if (file.endsWith(".md")) throw new Error("raw Markdown link was not converted");
  return { file, fragment: decodeURIComponent(url.hash.slice(1)) };
}

function regularFile(root, file) {
  let cursor = root;
  const rootInfo = lstatSync(root);
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error("artifact root is not a regular directory");
  for (const segment of file.split("/")) {
    cursor = join(cursor, segment);
    const info = lstatSync(cursor);
    if (info.isSymbolicLink()) throw new Error("symbolic targets are not followed");
  }
  if (!lstatSync(cursor).isFile()) throw new Error("target is not a regular file");
  return cursor;
}

export function checkSite(root, { pages = COURSE_PAGES, base = BASE, requiredAnchors = true } = {}) {
  const failures = [];
  const parsed = new Map();
  const get = (file) => {
    if (!parsed.has(file)) parsed.set(file, parseHtml(readFileSync(regularFile(root, file), "utf8")));
    return parsed.get(file);
  };
  for (const page of pages) {
    const file = page.file.replace(/\.md$/, ".html");
    let document;
    try { document = get(file); }
    catch { failures.push(`${file}: expected course page is missing or unsafe`); continue; }
    const bar = document.languageBar;
    if (!bar || entities(bar).indexOf("中文") < 0 || entities(bar).indexOf("English") < 0
      || entities(bar).indexOf("中文") > entities(bar).indexOf("English")) {
      failures.push(`${file}: missing Chinese-first language bar`);
    } else {
      const translation = `${page.translation === "/" ? "" : page.translation.slice(1)}index.html`;
      const counterpart = parseHtml(`<p>${bar}</p>`).links.some(({ href }) => {
        try { return localTarget(href, file, base)?.file === translation; } catch { return false; }
      });
      if (!counterpart) failures.push(`${file}: language switch does not point to the matching translated page`);
      const chineseLinked = /<a\b[^>]*>\s*中文\s*<\/a>/i.test(bar);
      const englishLinked = /<a\b[^>]*>\s*English\s*<\/a>/i.test(bar);
      if (page.locale === "en" ? !chineseLinked || englishLinked : chineseLinked || !englishLinked) {
        failures.push(`${file}: current language must be plain text and the other language linked`);
      }
    }
    if (requiredAnchors) {
      const required = file.includes("guides/architecture/") ? "scheduled-grants" : file.includes("guides/course-map/") ? "intentional-differences" : undefined;
      if (required && !document.anchors.has(required)) failures.push(`${file}: missing stable documentation anchor`);
    }
    for (const { href } of document.links) {
      let target;
      try { target = localTarget(href, file, base); }
      catch { failures.push(`${file}: invalid local URL or unconverted Markdown destination`); continue; }
      if (!target) continue;
      try {
        regularFile(root, target.file);
        if (target.fragment && target.file.endsWith(".html") && !get(target.file).anchors.has(target.fragment)) {
          failures.push(`${file}: fragment target is missing in ${target.file}`);
        }
      } catch { failures.push(`${file}: local target is missing or unsafe: ${target.file}`); }
    }
  }
  return failures;
}

export function main(root = process.cwd()) {
  const failures = checkSite(join(root, "docs", ".vitepress", "dist"));
  if (failures.length) { console.error("Static site check failed:\n" + failures.join("\n")); return 1; }
  console.log(`Static site check passed (${COURSE_PAGES.length} course pages, links, resources, anchors and translated counterparts).`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(); }
  catch { console.error("Static site check failed: expected build output is unavailable."); process.exitCode = 1; }
}
