# Public Source To TypeScript Map

<p align="center"><a href="../../../guides/course-map/">中文</a> &middot; English</p>

The public course and downloadable Python project are the reference, not local
company systems. Its executable source stops at lesson 11. Lessons 12-18 add
learning material rather than separate source implementations in that download;
this repository does not pretend to port code that is not present.

The remaining public reading material is useful after the code walkthrough:

| Lesson | Architecture reading |
| --- | --- |
| 12 | [Claude Code](https://namiai.tech/articles/agent-claude-code/) |
| 13 | [Codex](https://namiai.tech/articles/agent-codex/) |
| 14 | [Pi](https://namiai.tech/articles/agent-pi/) |
| 15 | [Grok Bot](https://namiai.tech/articles/agent-grok/) |
| 16 | [DeepSeek Harness](https://namiai.tech/articles/agent-deepseek-harness/) |
| 17 | [OpenClaw and Hermes](https://namiai.tech/articles/agent-openclaw-hermes/) |
| 18 | [Overall comparison](https://namiai.tech/articles/agent-comparison/) |

Hooks, OS sandboxes, cloud browsers, plugins, and tree-shaped sessions in those
articles are industrial comparisons or future study, not implemented features
of the downloadable lesson source or this educational port.

The Python course repeats accumulated files in each lesson. This version keeps
one reusable implementation per capability, then composes them in `src/course.ts`.
The root CLI supports cumulative lessons 02-11, while 01 stays independently small.

| Lesson | Python increment | TypeScript equivalent | Offline entry |
| --- | --- | --- | --- |
| [01](../../lessons/01-minimal-loop/index.md) | `agent.py`: file/shell tools and bounded model loop | `01-minimal-loop/{tools,model,agent,cli}.ts` | `pnpm lesson:01:demo` (interactive shell approval) |
| [02](../../lessons/02-tool-system/index.md) | `tools.py`, multi-turn CLI | `02-tool-system/{registry,tools,agent}.ts` | `pnpm lesson:02:demo` |
| [03](../../lessons/03-permissions/index.md) | `permissions.py`: hard rules and confirmation | `03-permissions/permissions.ts` | `pnpm lesson:03:demo` |
| [04](../../lessons/04-context/index.md) | `context.py` and persisted transcripts | `04-context/{context,sessions}.ts` | `pnpm lesson:04:demo` |
| [05](../../lessons/05-skills/index.md) | `skills.py`: project notes, discovery, lazy bodies | `05-skills/skills.ts` | `pnpm lesson:05:demo` |
| [06](../../lessons/06-chat-channel/index.md) | `telegram.py`, `bot.py`: channel, queues, approvals | `06-chat-channel/{telegram,approvals,bot}.ts` | `pnpm lesson:06:demo` |
| [07](../../lessons/07-scheduling/index.md) | `scheduler.py`: interval/daily tasks and heartbeat | `07-scheduling/{time,store,scheduler,tools}.ts` | `pnpm lesson:07:demo` |
| [08](../../lessons/08-mcp/index.md) | `mcp_client.py`, local demo server | `08-mcp/{mcp,demo-server}.ts` | `pnpm lesson:08:demo` |
| [09](../../lessons/09-subagents/index.md) | `subagent.py`: explore, worker, parallel children | `09-subagents/subagents.ts` | `pnpm lesson:09:demo` |
| [10](../../lessons/10-planning/index.md) | `planning.py`: plan mode, progress, reviewed exit | `10-planning/planning.ts` | `pnpm lesson:10:demo` |
| [11](../../lessons/11-memory/index.md) | `memory.py`: stable facts and history search | `11-memory/memory.ts` | `pnpm lesson:11:demo` |

Paths in the table are relative to `lessons/`. Every lesson includes deterministic
tests and its own README; click its lesson number for the guide in this language.
`src/{session,course,cli}.ts` supplies ownership, cumulative
registration, terminal/Telegram lifecycle, scheduling, and external configuration.

## Acceptance By Capability

The loop preserves `tool_call_id`, executes observations in order, and has explicit
completed/round-limit results. Registry validation happens before permissions or
execution. The basic tool set includes listing, reading, writing, shell, and bounded
public URL fetching. Multi-turn history survives in memory from lesson 02, and on
disk from 04. Long observations can be clipped, cleaned, and summarized without
breaking complete tool-call groups. Skills load through a protected tool.

Chat input is allowlisted, same-chat work is serialized, and approvals remain
receivable while turns run. Schedules persist before execution, coalesce missed
runs, isolate fresh histories, and suppress exactly `HEARTBEAT_OK` for heartbeats.
MCP initializes, paginates tool discovery, matches concurrent JSON-RPC responses,
invokes tools, and closes processes. Children have separate histories, limited
rounds and depth, read-only parallelism, and original host permission enforcement.
Plans block side effects until reviewed; execution still asks tool permissions.
Approved stable memory is injected at a new session, while saved-history search
returns bounded snippets rather than loading every transcript into the prompt.

## Intentional Differences

- Tool arguments are untrusted at runtime even though application code uses TypeScript types. The registry validates a documented JSON Schema subset before execution, not the entire JSON Schema standard. Review external MCP schemas and server implementations rather than relying on unsupported keywords.
- Workspace file paths reject traversal, escaping symlinks, and multiply hard-linked files. Internal workspace symlinks may resolve to ordinary permitted targets; private state, instructions, grants, and MCP configuration have their own stronger link checks. This is not comprehensive protection against malicious filesystem races.
- Shell commands run only after explicit review, with bounded output/time and sensitive environment values removed. An allowed shell can still access resources outside the workspace; command filtering is not an OS sandbox.
- HTTP fetch requires exact human approval (or an exact scheduled grant), rejects non-HTTP(S) schemes and URL credentials, limits returned text/time, and does not follow redirects. It does not block private/loopback addresses or pin DNS: approving a URL is trusting its network destination. Tests inject responses and never use company endpoints or personal authenticated HTTP sessions.
- Git/runtime separation is explicit. Sessions and memory are external private state, not files the ordinary agent workspace tools can modify. Custom workspace/state paths still need operator review before publishing.
- The context default uses an approximate character-to-token budget, not a model-specific tokenizer. A host may inject provider usage through `updateUsage`; real summarization is an extra paid request and can lose information.
- Telegram accepts allowlisted private-chat text only. Approval binds user, chat, workspace, request ID, and exact displayed parameters; it never treats a stale bare `y` as current permission.
- Scheduled `allow` names alone do not grant effects. An external user-issued grant must match actor, tool name, and all arguments. Shell, scheduling mutations, recursive delegation, and memory updates are not unattended capabilities.
- MCP is explicit opt-in, with reviewed executable startup and a minimal child environment. Only host-reviewed safe tools are available to read-only children; server annotations cannot upgrade trust. This text-only course omits rich MCP media and refuses server requests for roots or model access.
- A child is a context boundary, not a separate OS principal. Workers run alone and reuse the original parent executor; only read-only children may run in parallel, up to three, with no recursive delegation.
- Plans and memories are application-owned state. A plan approval cannot waive write approval, and each actual memory change needs a fresh decision even after a remembered file-write allowance.
- Transcript rollback does not undo accepted tool side effects. File persistence is bounded and atomic within its documented limits; scheduling is single-process, not distributed exactly-once execution.

## Verification Boundary

`pnpm check`, standalone demos, and the composed demo use deterministic model,
clock, HTTP, approval, and channel fixtures. Real filesystem operations and a
bundled local stdio MCP process are exercised. These checks do not validate model
reasoning quality, real provider credentials, Telegram delivery, arbitrary MCP
servers, distributed deployment, or Windows descendant-process cleanup. Configure
personal integrations separately and record their results honestly.
