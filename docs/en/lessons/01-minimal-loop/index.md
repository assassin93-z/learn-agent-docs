# Lesson 01: The Minimal Agent Loop

<p align="center"><a href="../../../lessons/01-minimal-loop/">中文</a> &middot; English</p>

The Python equivalent is `lesson-01` in the public Nami Agent course.
We keep three fixed tools and one explicit async loop, without an agent framework.

## Run It

From the repository root, after installing with pnpm:

```bash
pnpm check
pnpm lesson:01:demo
```

The offline demo uses a scripted `ModelClient` with the real tools. It writes
`playground/hello.cjs`, reads it back, asks for approval to run `node hello.cjs`,
and returns the last tool result on the fourth model round. Approve with `y`;
any other answer, EOF, or non-interactive input denies execution. It needs neither
a key nor network access, but does not test a real provider or model reasoning.

To use a real model, configure a personal `API_KEY` in your environment or ignored
`.env`, using `.env.example` as a guide:

```bash
pnpm lesson:01 -- "Write hello.cjs that prints hello, read it, then run it."
```

`BASE_URL` and `MODEL` select an OpenAI-compatible provider; the defaults match
the Python lesson's DeepSeek setup. The CLI loads `.env` only if it exists. Output
uses an ignored `playground` workspace by default. Each CLI invocation is one task,
not a persistent chat session. Exit codes are 0 for a finished reply, 1 for input or
provider failure, and 2 for the round limit. "Finished" means no more tool calls,
not an independent guarantee that the task succeeded.

## Read In This Order

| File | Learning focus |
| --- | --- |
| `types.ts` | Tool schemas describe the API; returned arguments are still JSON strings. |
| `tools.ts` | Ordinary Node.js functions validate and execute model-selected operations. |
| `model.ts` | A small interface separates provider transport from agent control flow. |
| `agent.ts` | An async loop owns history, tool dispatch, results, and stopping. |
| `terminal.ts`, `cli.ts` | Human approval, local configuration, and visible output. |
| `demo.ts`, `*.test.ts` | Scripted responses make the protocol deterministic and testable. |

For a frontend developer, Python's `dict` maps to typed objects, `json.loads` to
`JSON.parse` plus runtime validation, and `subprocess.run` to an awaited Node.js
child process. The OpenAI-compatible API and agent state machine are unchanged;
TypeScript's discriminated `role` union makes message shapes easier to follow.

## First Building Block: Tools

The model cannot execute code. It sees JSON schemas and returns a function name
plus JSON arguments. Our Node.js process is responsible for validating and running them.

| Tool | Arguments | Behavior |
| --- | --- | --- |
| `read_file` | `path` | Read a UTF-8 file from the workspace. |
| `write_file` | `path`, `content` | Write or replace a workspace file. |
| `run_shell` | `command` | Ask for approval, then run a command in the workspace. |

TypeScript types disappear at runtime. JSON from the model still needs validation:
reject unknown tools, non-object arguments, missing or non-string fields, and extra fields.
Errors become tool results so a later model turn can correct the request.

```bash
pnpm exec vitest run lessons/01-minimal-loop/tools.test.ts
```

## The Loop

```text
system + user task
    -> await model.complete(history, tool schemas)
    -> append assistant message
    -> no tool calls? return its text
    -> otherwise validate and await each tool in order
    -> append one tool message per call, using its tool_call_id
    -> repeat with the updated history
```

The model chooses a tool but never executes it. The host process executes it and
returns observations. Save the assistant's call **before** its tool results; each
result must match its call ID. Calls remain sequential because a read may depend
on a preceding write. A failed tool becomes an observation so the next round can
repair its arguments. A failed provider request stops the task rather than faking
success. The default limit is 20 **model rounds**, not 20 tool calls; one response
can contain several calls. Every task starts with fresh in-memory history.

`ModelClient` is dependency injection, not a second agent abstraction. Tests inject
scripted replies into the same loop, and local HTTP fixtures verify the real SDK's
JSON protocol without contacting a provider. Provider/model compatibility and
quality still need testing with your personal account.

## Safety Boundaries

Unlike the original first lesson, file paths are restricted to a dedicated workspace,
including checks for existing symlink escapes. This is an early safety enhancement,
not the later lesson's complete permission system.

File access rejects multiply linked regular files as well as external symbolic links,
and reads retain a bounded prefix using a file handle rather than loading an entire
large file before truncating it. These checks reduce static file-alias escapes.

Shell approval is required for every command. Output collection is bounded and commands
time out after 60 seconds by default. The child process receives a small environment
allowlist instead of inherited API keys, credentials, or personal tool directories.
Command previews and displayed model text escape terminal control and direction-changing
characters. On POSIX, timeouts kill the command's process group; Windows descendant
cleanup has not been validated and is not guaranteed by this implementation.

The provider adapter also builds explicit JSON headers instead of inheriting SDK
organization, project, or custom-header environment values. It disables SDK logs,
sets a 60-second request timeout, disables retries and redirects, and reports safe
errors without raw provider bodies, headers, URLs, or filesystem paths. These
defaults reduce accidental leaks; they are not a policy for approving arbitrary endpoints.

**A working directory and a confirmation prompt are not an operating-system sandbox.**
An approved shell command can still access files or the network outside the workspace.
Use a disposable directory, review commands, and never run this agent against work data.
File path checks also do not guarantee safety against malicious concurrent file replacement.
