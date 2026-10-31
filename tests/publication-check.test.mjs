import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { inspectContent, inspectFiles, walkArtifact } from "../scripts/check-public-files.mjs";

test("validates committed third-party notices before every production build", () => {
  const { scripts } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(scripts["notices:generate"], "node scripts/generate-notices.mjs");
  assert.equal(scripts["check:notices"], "node scripts/generate-notices.mjs --check");
  assert.equal(scripts["docs:build"], "pnpm check:notices && vitepress build docs");
  assert.ok(scripts.check.split(" && ").includes("pnpm docs:build"));
});

test("accepts reviewed documentation and public dependency resolution", () => {
  assert.deepEqual(inspectContent("docs/index.md", "# 学习\n\n[课程](https://namiai.tech/agent/)"), []);
  assert.deepEqual(inspectContent("pnpm-lock.yaml", "resolution: https://registry.npmjs.org/vitepress/-/vitepress-1.6.4.tgz"), []);
  assert.deepEqual(inspectContent("package.json", JSON.stringify({ private: true, packageManager: "pnpm@11.22.0", devDependencies: { vitepress: "1.6.4", vue: "3.5.13" } })), []);
});

test("limits Markdown and source file publication to the documentation whitelist", () => {
  for (const file of ["README_CN.md", "docs/extra.md", "src/agent.ts", "lessons/demo.ts", ".env", ".npmrc", ".git/config", ".runtime/session.json"]) {
    assert.ok(inspectContent(file, "fixture").includes("file is outside the publication whitelist"), file);
  }
  assert.ok(inspectContent("README_CN.md", "fixture").includes("redundant Chinese documentation"));
  assert.deepEqual(inspectContent(".github/workflows/deploy.yml", "permissions:\n  pages: write\n  id-token: write"), []);
});

test("detects token and private-key fixtures without reporting their contents", () => {
  const fixtures = ["ghp_" + "a".repeat(32), "sk-" + "b".repeat(32), ["-----BEGIN", "PRIVATE KEY-----"].join(" ")];
  for (const fixture of fixtures) {
    const failures = inspectContent("README.md", fixture);
    assert.ok(failures.length > 0);
    assert.ok(failures.every((failure) => !failure.includes(fixture)));
  }
});

test("detects private network and machine-specific fixture values", () => {
  const fixtures = [
    [192, 168, 1, 20].join("."),
    [10, 2, 3, 4].join("."),
    [172, 20, 3, 4].join("."),
    "https://service." + "internal/path",
    ["", "home", "sample", "note"].join("/")
  ];
  for (const fixture of fixtures) assert.ok(inspectContent("README.md", fixture).length > 0);
  assert.deepEqual(inspectContent("README.md", "Personal API_KEY and ./playground are placeholders."), []);
});

test("detects restricted context in plain and escaped build artifacts", () => {
  const characters = [0x9762, 0x8bd5];
  const text = String.fromCodePoint(...characters);
  const escaped = characters.map((character) => "\\u" + character.toString(16)).join("");
  assert.ok(inspectContent("README.md", text).includes("non-learning context"));
  assert.ok(inspectContent("assets/search.js", escaped, { artifact: true }).includes("non-learning context"));
  const english = String.fromCodePoint(105, 110, 116, 101, 114, 118, 105, 101, 119);
  assert.ok(inspectContent("README.md", english).includes("non-learning context"));
});

test("rejects a different package manager, runtime packages and unreviewed tarballs", () => {
  assert.ok(inspectContent("package-lock.json", "{}").includes("only the pnpm lockfile is allowed"));
  assert.ok(inspectContent("pnpm-lock.yaml", "tarball: ../unreviewed.tgz").includes("explicit tarball resolution requires review"));
  assert.ok(inspectContent("pnpm-lock.yaml", "url: https://example.com/dependency.tgz").includes("lockfile URL is not a public npm registry URL"));
  const manifest = { private: false, packageManager: "npm@10", dependencies: { openai: "1" }, devDependencies: { unrelated: "1" } };
  const failures = inspectContent("package.json", JSON.stringify(manifest));
  assert.ok(failures.includes("package publication or package-manager policy differs"));
  assert.ok(failures.includes("runtime dependencies are not expected in a documentation repository"));
  assert.ok(failures.includes("dependency is outside the documentation dependency whitelist"));
});

test("scans generated JavaScript search artifacts, not only HTML", () => {
  const token = "ghp_" + "a".repeat(32);
  assert.ok(inspectContent("assets/search.js", token, { artifact: true }).includes("access token"));
  assert.ok(inspectContent("source/config.json", "{}", { artifact: true }).includes("file is outside the publication whitelist"));
  assert.deepEqual(inspectContent("assets/course.js", "export const title = 'Learning';", { artifact: true }), []);
  assert.deepEqual(inspectContent("assets/chunks/@localSearchIndexroot.hash-123.js", "export default {};", { artifact: true }), []);
  assert.deepEqual(inspectContent("assets/chunks/@localSearchIndexen.hash-123.js", "export default {};", { artifact: true }), []);
  assert.deepEqual(inspectContent("vp-icons.css", ".icon { display: block; }", { artifact: true }), []);
  assert.deepEqual(inspectContent("docs/public/THIRD_PARTY_NOTICES.txt", "Reviewed third-party license text."), []);
  assert.deepEqual(inspectContent("THIRD_PARTY_NOTICES.txt", "Reviewed third-party license text.", { artifact: true }), []);
  assert.ok(inspectContent("assets/chunks/@unreviewed.hash.js", "export default {};", { artifact: true }).includes("file is outside the publication whitelist"));
});

test("allows only esbuild and omits only the reviewed upstream cross-build package", () => {
  const policy = "allowBuilds:\n  esbuild: true\nignoredOptionalDependencies:\n  - \"@napi-rs/lzma-linux-x64-gnu\"\n";
  const actual = readFileSync(new URL("../pnpm-workspace.yaml", import.meta.url), "utf8");
  assert.deepEqual(inspectContent("pnpm-workspace.yaml", policy), []);
  assert.deepEqual(inspectContent("pnpm-workspace.yaml", actual), []);
  const invalid = [
    "allowBuilds:\n  esbuild: true\n",
    policy.replace("esbuild: true", "'*': true"),
    policy.replace("esbuild: true", "esbuild: true\n  unrelated: true"),
    policy.replace("@napi-rs/lzma-linux-x64-gnu", "@napi-rs/lzma-*"),
    policy.replace("@napi-rs/lzma-linux-x64-gnu", "*"),
    policy + "  - unrelated\n",
    policy + "optional: false\n"
  ];
  for (const candidate of invalid) {
    assert.ok(inspectContent("pnpm-workspace.yaml", candidate)
      .includes("dependency policies must allow only esbuild and omit only the reviewed optional package"));
  }
});

test("artifact walker rejects links and scans ordinary generated files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "docs-artifact-"));
  try {
    await mkdir(join(directory, "assets"));
    await writeFile(join(directory, "index.html"), "<h1>Learning</h1>");
    await writeFile(join(directory, "assets", "search.js"), "export default {};");
    assert.deepEqual(walkArtifact(directory).sort(), ["assets/search.js", "index.html"]);
    await symlink(join(directory, "index.html"), join(directory, "linked.html"));
    assert.throws(() => walkArtifact(directory), /symbolic artifacts/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("file inspection rejects path escape and symbolic source files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "docs-publication-"));
  try {
    await writeFile(join(directory, "README.md"), "# Learning");
    assert.deepEqual(inspectFiles(directory, ["README.md"]), []);
    assert.ok(inspectFiles(directory, ["../outside.md"]).includes("publication path leaves its root"));
    await symlink(join(directory, "README.md"), join(directory, "README_EN.md"));
    assert.ok(inspectFiles(directory, ["README_EN.md"]).some((failure) => failure.includes("unable to safely inspect")));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("refuses symbolic roots and parent directories before reading publication content", async () => {
  const directory = await mkdtemp(join(tmpdir(), "docs-boundary-"));
  try {
    await mkdir(join(directory, "real"));
    await writeFile(join(directory, "real", "index.md"), "# Learning");
    await symlink(join(directory, "real"), join(directory, "docs"));
    assert.ok(inspectFiles(directory, ["docs/index.md"]).some((failure) => failure.includes("unable to safely inspect")));
    assert.throws(() => walkArtifact(join(directory, "docs")), /symbolic/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
