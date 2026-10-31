import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { COURSE_PAGES } from "./course-pages.mjs";

const markdownFiles = new Set(["README.md", "README_EN.md", ...COURSE_PAGES.map(({ file }) => `docs/${file}`)]);
const binaryExtensions = /\.(?:woff2?|ttf|png|jpe?g|gif|webp|ico)$/i;
const alternateLocks = new Set(["package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "bun.lock", "bun.lockb"]);

const patterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["access token", /\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{20,})\b/],
  ["machine-specific path", /(?:\/(?:home|Users|data\d+|opt)\/|[A-Z]:\\Users\\)/],
  ["private IPv4 address", /(?<![\d.])(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?![\d.])/],
  ["private host", /https?:\/\/[^/\s"'`]*(?:\.(?:internal|corp|local|lan))(?=[:/\s"'`]|$)/i],
  ["non-learning context", /\u9762\u8bd5|\x69nterview/i],
  ["local workflow metadata", /\x54\x54\x41\x44\x4b-Launch-Id|\x4d\x45\x45\x47\x4f_LINK/]
];

function publicSourcePath(file) {
  if (markdownFiles.has(file)) return true;
  if ([".gitignore", "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "docs/public/THIRD_PARTY_NOTICES.txt"].includes(file)) return true;
  if (/^\.github\/workflows\/[^/]+\.ya?ml$/.test(file)) return true;
  if (/^scripts\/[^/]+\.mjs$/.test(file) || /^tests\/[^/]+\.test\.mjs$/.test(file)) return true;
  if (/^docs\/\.vitepress\/(?:config\.m(?:t|j)s|theme\/(?:[^/]+\.(?:js|mjs|vue|css)))$/.test(file)) return true;
  return /^docs\/public\/[^/]+\.(?:svg|png|webp|ico)$/.test(file);
}

function publicArtifactPath(file) {
  const pages = new Set(COURSE_PAGES.map(({ file }) => file.replace(/\.md$/, ".html")));
  return pages.has(file) || ["404.html", "sitemap.xml", "robots.txt", "hashmap.json", "vp-icons.css", "THIRD_PARTY_NOTICES.txt", ".nojekyll"].includes(file)
    || /^assets\/chunks\/@localSearchIndex(?:en|root)\.[A-Za-z0-9_-]+\.js$/.test(file)
    || /^assets\/[A-Za-z0-9_./-]+\.(?:js|css|json|svg|woff2?|ttf|png|jpe?g|gif|webp|ico)$/.test(file);
}

function normalizeEscapes(content) {
  return content.replace(/\\u([\da-f]{4})|\\x([\da-f]{2})/gi, (_, unicode, hex) => String.fromCharCode(Number.parseInt(unicode ?? hex, 16)));
}

export function inspectContent(file, content, { artifact = false } = {}) {
  const failures = [];
  const name = basename(file);
  if (!(artifact ? publicArtifactPath(file) : publicSourcePath(file))) failures.push("file is outside the publication whitelist");
  if (name === ".npmrc" || name === ".env" || name.startsWith(".env.")) failures.push("credential or environment file");
  if (alternateLocks.has(name)) failures.push("only the pnpm lockfile is allowed");
  if (file.endsWith("_CN.md")) failures.push("redundant Chinese documentation");
  const text = artifact ? normalizeEscapes(content) : content;
  for (const [label, pattern] of patterns) if (pattern.test(text)) failures.push(label);
  if (name === "pnpm-lock.yaml") {
    const urls = text.match(/[a-z][a-z0-9+.-]*:\/\/[^\s"'`{},\[\]]+/gi) ?? [];
    if (urls.some((url) => !url.startsWith("https://registry.npmjs.org/"))) failures.push("lockfile URL is not a public npm registry URL");
    if (/(?:^|[\s{,])(?:tarball|"tarball"|'tarball')\s*:/m.test(text)) failures.push("explicit tarball resolution requires review");
  }
  if (name === "pnpm-workspace.yaml") {
    const policy = text.replaceAll("\r\n", "\n").trim();
    const expected = "allowBuilds:\n  esbuild: true\nignoredOptionalDependencies:\n  - \"@napi-rs/lzma-linux-x64-gnu\"";
    if (policy !== expected) failures.push("dependency policies must allow only esbuild and omit only the reviewed optional package");
  }
  if (name === "package.json") {
    try {
      const pkg = JSON.parse(text);
      if (pkg.private !== true || pkg.packageManager !== "pnpm@11.22.0") failures.push("package publication or package-manager policy differs");
      if (Object.keys(pkg.dependencies ?? {}).length) failures.push("runtime dependencies are not expected in a documentation repository");
      if (Object.keys(pkg.devDependencies ?? {}).some((dependency) => !["vitepress", "vue"].includes(dependency))) {
        failures.push("dependency is outside the documentation dependency whitelist");
      }
    } catch { failures.push("invalid package manifest"); }
  }
  return failures;
}

export function walkArtifact(root, directory = "") {
  const directoryInfo = lstatSync(join(root, directory));
  if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink()) throw new Error("artifact directories must not be symbolic");
  const files = [];
  for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
    const file = join(directory, entry.name).split(sep).join("/");
    const info = lstatSync(join(root, file));
    if (info.isSymbolicLink()) throw new Error("symbolic artifacts are not allowed");
    if (info.isDirectory()) files.push(...walkArtifact(root, file));
    else if (info.isFile()) files.push(file);
    else throw new Error("artifact must be a regular file");
  }
  return files;
}

export function inspectFiles(root, files, { artifact = false, staged = false } = {}) {
  const failures = [];
  for (const file of files) {
    const absolute = resolve(root, file);
    const relativePath = relative(root, absolute);
    if (relativePath === ".." || relativePath.startsWith(`..${sep}`)) {
      failures.push("publication path leaves its root");
      continue;
    }
    if (!(artifact ? publicArtifactPath(file) : publicSourcePath(file))) {
      failures.push(`${JSON.stringify(file)}: file is outside the publication whitelist`);
      continue;
    }
    try {
      if (staged) {
        const modes = execFileSync("git", ["ls-files", "--stage", "--", file], { cwd: root, encoding: "utf8" });
        if (modes.startsWith("120000 ") || modes.startsWith("160000 ")) throw new Error("symbolic files are not allowed");
      } else {
        let cursor = root;
        const rootInfo = lstatSync(cursor);
        if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error("publication root must be a regular directory");
        for (const segment of relativePath.split(sep)) {
          cursor = join(cursor, segment);
          if (lstatSync(cursor).isSymbolicLink()) throw new Error("symbolic publication ancestors are not followed");
        }
        const info = lstatSync(absolute);
        if (!info.isFile() || info.isSymbolicLink() || info.nlink > 1) throw new Error("publication file must be a single-link regular file");
      }
      if (binaryExtensions.test(file)) {
        if (!(artifact ? publicArtifactPath(file) : publicSourcePath(file))) failures.push(`${JSON.stringify(file)}: binary asset is outside the whitelist`);
        continue;
      }
      const content = staged
        ? execFileSync("git", ["show", `:${file}`], { cwd: root, encoding: "utf8" })
        : readFileSync(absolute, "utf8");
      for (const reason of inspectContent(file, content, { artifact })) failures.push(`${JSON.stringify(file)}: ${reason}`);
    } catch (error) {
      if (!staged && error.code === "ENOENT") continue;
      failures.push(`${JSON.stringify(file)}: unable to safely inspect publication file`);
    }
  }
  return failures;
}

export function main(args = process.argv.slice(2), root = process.cwd()) {
  if (args.some((arg) => !["--staged", "--dist"].includes(arg)) || (args.includes("--staged") && args.includes("--dist"))) {
    throw new Error("choose either a staged source check or an artifact check");
  }
  const artifact = args.includes("--dist");
  const staged = args.includes("--staged");
  const scope = artifact ? join(root, "docs", ".vitepress", "dist") : root;
  const files = artifact ? walkArtifact(scope) : [...new Set(execFileSync("git", staged
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
    : ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean))];
  const failures = inspectFiles(scope, files, { artifact, staged });
  if (failures.length) {
    console.error("Publication check failed:\n" + failures.join("\n"));
    return 1;
  }
  console.log(`Publication check passed (${files.length} ${artifact ? "artifact" : "source"} files). Manual review remains required.`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(); }
  catch { console.error("Publication check failed: unable to inspect the expected publication scope."); process.exitCode = 1; }
}
