# Lesson 02: A Tool Registry

<p align="center"><a href="../../../lessons/02-tool-system/">中文</a> &middot; English</p>

This corresponds to Python `lesson-02`: replace a hard-coded dispatch table with
registered tool definitions and a unified executor. The agent loop no longer
needs to know how any particular tool works.

## Run Offline

From the repository root:

```bash
pnpm exec vitest run lessons/02-tool-system
pnpm exec tsx lessons/02-tool-system/demo.ts
```

The demo uses a scripted model, temporary workspace, and injected fetch response.
It performs no provider request and requires no credentials. Temporary files are
removed afterward. It tests orchestration, not model reasoning.

## Read In Order

1. `registry.ts`: a definition combines JSON schema, a function, and risk metadata.
2. `tools.ts`: register list, read, write, shell, and fetch implementations.
3. `paths.ts`: resolve existing ancestors before creating nested directories.
4. `agent.ts`: `runTurn` updates a caller-owned conversation instead of starting over.
5. The tests: validation, approval ordering, failure observations, and output bounds.

Python decorators register functions during import. Here `registry.register` is
explicit: no import side effects or hidden global registry. `schemas` gives the
model defensive copies of descriptions; `execute` parses returned JSON and
`executeArgs` validates it before approval and execution.

The supported JSON Schema subset covers objects, arrays, scalar types, required
properties, extra-property rules, enum values, array items, and common bounds.
It is not a complete JSON Schema implementation. Nested validation supports later
planning and MCP tools without evaluating schema text as code.
Unsupported constraints such as `$ref`, `anyOf`, `oneOf`, `allOf`, `pattern`, and
`format` are not enforced. Audit external schemas and tool implementations before
registering them; never mark a tool safe merely because its schema looks restrictive.

`runTurn` preserves history across user tasks. Assistant calls precede matching
tool results, calls remain sequential, and the default cap is 20 model rounds.
It does not save conversations to disk yet; lesson 04 adds that concern.

## Safety Baseline

Unlike the original second lesson, unsafe tools do not run without a host approval
guard. Only explicitly `safe` tools run by default; `confirm`, unknown risk, and
`deny` fail closed. A guard receives validated arguments, not raw model JSON.
The later permission lesson implements a reusable guard policy.

Builtin file paths stay in the workspace, including checks for symlink escapes.
Nested writes check each existing ancestor before creating directories, and file
tools reject directories, FIFOs, devices, and multiply linked files. An opened
file handle is checked again before reading or truncating; large files are read
through an early-stopping bounded stream, not fully loaded then shortened.
Results are bounded Unicode text;
exceptions become stable observations without raw error paths or provider bodies.

Shell commands use the previous lesson's bounded output and minimal child
environment, with a 30-second timeout. Fetch requests have a 15-second timeout,
do not follow redirects, and require approval. Approval is not an OS sandbox:
an approved shell command or URL can still access resources beyond the workspace.
Fetch does not reject private addresses or pin DNS. Approve only a destination
you intend to trust; do not use company endpoints or authenticated work data.
