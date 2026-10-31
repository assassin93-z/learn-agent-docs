# Learn Agent

<p align="center"><a href="../">中文</a> &middot; English</p>

::: info Documentation only
This public site provides course documentation, not the private TypeScript source or Git history. Running the examples requires access to a source checkout; this site does not execute an agent.
:::


Build an agent in TypeScript and Node.js, one explainable capability at a time.
This independent learning project follows the public
[Nami Agent course](https://namiai.tech/agent/), whose downloadable Python source
contains lessons 01-11. It is not a production agent or an OS security sandbox.

Start with the [learning path](guides/learning-path/index.md), use the
[source-to-TS feature map](guides/course-map/index.md) to compare implementations, and read
[the architecture guide](guides/architecture/index.md) for frontend analogies and architecture questions.
The implementation keeps reusable lesson modules instead of copying the entire
application into every lesson. `--lesson N` composes only capabilities through N.

Each guide and lesson README has exactly two versions: unsuffixed `.md` files
(Chinese by default) and `_EN.md` files (English). Choose a language using the
switch at the top. Keep both languages updated together and preserve their
code examples. `pnpm check:docs`
checks language links, local targets and anchors in the current inline/HTML link
forms, heading structure, and fenced example parity, and rejects redundant Chinese copies;
it does not replace human translation review.

## Public Course Documentation

The [public reading site](https://assassin93-z.github.io/learn-agent-docs/) publishes
course documentation only. It does not grant access to the private TypeScript
source or Git history, and it does not run an agent online. The existing Chinese
and English Markdown is the sole authored course source; the publication repository
stores whitelist-exported website sources, not another manually maintained copy.
People with source access can export from their local source checkout:

```bash
pnpm docs:export -- --output ../learn-agent-docs/docs
```

Only the homepage, three guides and eleven lessons in both languages are exported.
Page links are converted while code examples are preserved. Review the publication
sources, static build output and search index before deployment.

## Quick Start

Use Node.js 22 (22.16+), 24, or 26+ and pnpm 11.22.0, as pinned in `package.json`.
`pnpm-lock.yaml` is the only dependency lockfile.

```bash
pnpm install --frozen-lockfile --registry=https://registry.npmjs.org
pnpm check
pnpm demos
pnpm agent:demo
```

Checks run TypeScript, deterministic tests, documentation consistency checks,
and publication hygiene scanning.
`pnpm demos` runs the ten standalone lessons 02-11 with a credential-free child
environment and bounded execution time/output. `pnpm agent:demo` runs the composed
course: real disposable file operations, scripted approvals, skill loading, a
bundled local stdio MCP server, read-only children, plan review, approved memory,
session search, and a quiet heartbeat. HTTP/model/channel responses are fixtures;
no API key or Telegram connection is needed. Demos remove their temporary state.

Keep lesson 01 separate to understand the smallest loop:

```bash
pnpm lesson:01:demo
pnpm lesson:04:demo
pnpm agent -- --help
```

Lesson 01's demo uses real file and shell tools in ignored `playground`: it writes
and reads `hello.cjs`, then asks before running `node hello.cjs`. Review and approve
that command with `y` in an interactive terminal. It is excluded from `pnpm demos`
because shell permission must not be silently supplied. Scripted models prove
orchestration and boundaries, not the quality of model reasoning.

## Use A Personal Model

Create an ignored `.env` based on the placeholder-only `.env.example` and set a
**personal** `API_KEY`, `BASE_URL`, and `MODEL`. Never use work credentials or data.

```bash
pnpm lesson:02 -- "List the disposable workspace and explain what you observe."
pnpm agent -- --session practice "Write hello.txt, then read it to verify the result."
pnpm lesson:10 -- "/plan Inspect the workspace and propose a small verified change."
```

The default is DeepSeek's OpenAI-compatible Chat Completions API. HTTPS is required
except for loopback testing, and redirects are not followed. Your provider receives
tasks, context, memories, and tool observations; requests and summarization can cost
money. CLI configuration defaults to `playground` for tools and `.runtime` for
private state. `--workspace` / `AGENT_WORKSPACE` / `NAMI_WORKSPACE` select the former;
`--state-dir` / `NAMI_STATE_DIR` select the latter. They must be disjoint directories.
Names passed to `--session` are labels, not paths. `/reset` clears conversation
history but keeps previously approved long-term memory for the next session.

`pnpm lesson:NN` selects the cumulative CLI for NN=02..11; each `:demo` selects
that lesson's standalone example. `pnpm agent` defaults to all eleven lessons.
An empty task starts a terminal REPL; `/quit` exits. `/plan TASK` starts in lesson
10, and `/tasks` lists actor-scoped schedules in lesson 07 and later.
For additional flags on a `bot` or `lesson:NN` alias, omit pnpm's `--` separator;
those aliases already inject a CLI flag. Use `pnpm agent -- --lesson N ...` if
you prefer the separator style for cumulative lessons.

## Personal Chat And External Tools

For [Telegram](lessons/06-chat-channel/index.md), add your own `TG_BOT_TOKEN` and
comma-separated `TG_ALLOWED_USERS` to ignored `.env`, then run `pnpm bot`. Only
allowlisted private-chat text is accepted. Each confirmation uses `y REQUEST_ID`,
`n REQUEST_ID`, or `a REQUEST_ID`; the last remembers file-write approval only.
Approvals are bound to the exact user/chat/workspace and displayed arguments.
Never put real tokens or user IDs in examples or Git.

Scheduling runs while bot mode is polling. Terminal mode intentionally does not
run a background scheduler or create chat-owned tasks. Task state is persisted;
missed intervals are coalesced, not all replayed. Daily schedules use the process
timezone. A scheduled turn starts fresh, never inherits remembered interactive
permissions, and needs an exact user-issued grant for any confirm-risk tool.
See the [grant example and timing limits](guides/architecture/index.md#scheduled-grants).

[MCP](lessons/08-mcp/index.md) starts only from an explicitly supplied, external,
reviewed config, never from a workspace file:

```bash
pnpm agent -- --mcp-config .runtime/mcp.json
pnpm bot --mcp-config .runtime/mcp.json --trust-mcp-config --grants-file .runtime/grants.json
```

Every server must be marked `trusted: true` and its launch approved.
`--trust-mcp-config` is a deliberate headless startup approval, not blanket tool
approval: unknown effects remain confirm-risk, and only host-reviewed `safeTools`
are read-only. Trusted shell and MCP processes still have your operating-system
permissions. The bundled offline MCP demo is not proof that an arbitrary server
or a real provider/Telegram account has been integration-tested.

## Publication Safety

- Keep credentials, work data, internal endpoints, personal machine paths, and local workflow metadata out of Git.
- `.env`, `.runtime`, `playground`, MCP/grant configs, and local JSON files are ignored; review any custom paths yourself.
- Dependencies use the public npm registry; Git author and committer use a personal GitHub noreply identity.
- Run `pnpm check:privacy` and review staged diffs before publishing. A regex scanner is a guardrail, not proof of complete secret detection.

The course deliberately tightens path, URL, approval, delegation, and scheduling
boundaries compared with the Python examples. There is no full filesystem-race
protection, cross-process scheduler guarantee, or rollback of tool side effects.
Read the [documented deviations](guides/course-map/index.md#intentional-differences).

Commit subjects use `<type>(<scope>): <imperative subject>`, at most 72 characters,
split by learning capability. Local workflow files and runtime metadata never
enter the repository.
