# Agent Architecture For Frontend Developers

<p align="center"><a href="../../../guides/architecture/">中文</a> &middot; English</p>

An agent is not a model that directly edits your computer. It is a host-managed
loop: the model proposes an action, ordinary TypeScript validates and authorizes
it, a tool executes, and its observation becomes the next model input. The host
owns identity, state, permissions, limits, and lifecycle. Model text owns none of
those privileges.

## Trace One Turn

```text
CLI or private-chat text + trusted actor
  -> CourseApp.runTask
  -> AgentSession.run (history snapshot and serialized turn)
  -> ContextManager.prepare (only from lesson 04)
  -> ModelClient.complete (system + history + tool schemas)
  -> assistant tool calls
  -> ToolRegistry (JSON parse -> schema -> guard)
  -> plan/read-only checks -> hard rules -> human/exact grant approval
  -> tool implementation -> bounded observation + matching tool_call_id
  -> next model request, until completion or round limit
  -> validated session save -> channel/terminal output
```

`src/course.ts` is the composition root: dependencies are injected, capabilities
are registered cumulatively, and no module import starts a bot or arbitrary MCP
server. `src/session.ts` owns message rollback and saving; `src/cli.ts` owns
configuration, terminal/bot lifecycle, and safe top-level diagnostics.

The familiar frontend equivalents help locate responsibilities:

| Frontend concept | Agent equivalent | Critical difference |
| --- | --- | --- |
| HTTP request DTO | Tool JSON Schema | TypeScript types disappear at runtime; model arguments still need validation. |
| Service registry / router | ToolRegistry | Discovery describes capability; execution guard enforces authorization. |
| UI state / reducer | Message history and PlanningState | Tool-result IDs and complete groups must survive every state transformation. |
| Middleware / route guard | PermissionManager | Approval cannot override path, owner, plan, or read-only hard rules. |
| Code splitting | Skill discovery plus `load_skill` | Small descriptions stay visible; large instruction bodies load on demand. |
| API client adapter | TelegramChannel and MCPServer | Provider errors may contain secrets; transport and trust are separate boundaries. |
| Worker task | Child agent | Independent context is not OS isolation or a privilege upgrade. |
| Local storage | SessionStore and MemoryStore | Storage is private, owner-scoped, bounded, and not model-writable configuration. |

## State And Concurrency

Every conversation belongs to `ChatActor { chatId, userId, workspaceId }`. The
workspace ID is derived from its canonical path; actor state lives in a hashed
subdirectory of an external state root. Neither model text nor an incoming task
chooses that actor. CLI uses a local actor; Telegram supplies verified private-chat
sender IDs. Owners do not share remembered approvals, session files, or memory.

Same-chat turns are queued. Polling is not blocked on a model turn, so a waiting
approval can be consumed immediately by the approval broker. Different chats may
run concurrently. Do not use a mutable global current-chat/current-session value
to route tool results or approvals. Workers run alone to avoid competing side
effects; parallel explore children are bounded to three and expose safe tools only.

On failure, `AgentSession` restores its history snapshot; accepted file writes or
network effects remain real. Shutdown first stops chat dispatch and pending
approvals, then closes the app guard/MCP processes and drains started work. A
model response arriving after closure cannot start another model request or tool.
Existing external side effects still require their own timeout and cleanup.

## Context, Plans, And Memory

There are three distinct context transformations: clip individual observations,
clear old observation content while keeping tool groups, and summarize older
complete turns. The default token budget is only a character proxy; real token
usage can be injected. Summaries are lossy, and failed summarization retains valid
history rather than inventing facts. Skill bodies are lazy observations, while
project notes and memory snapshots enter at a controlled session boundary.

`/plan TASK` changes host state to read-only. `update_plan` tracks bounded steps;
`submit_plan` asks for the exact plan and changes host mode only after fresh
approval. It is not a grant for later writes, shell, MCP calls, or memory changes.
Each actual side effect still passes the registry guard.

Memory holds approved stable facts, not a hidden recording of every task. A
`remember` proposal asks once for each actual add/replace/remove and writes through
an external bounded store. The next session receives a snapshot; the current
session's system text is not silently rewritten. `search_sessions` retrieves a few
bounded user/assistant snippets from the owner's saved sessions, not system prompts
or tool results. This implementation is keyword retrieval, not vector RAG.

## Scheduled Grants

Scheduling is a chat/bot capability in the composed app. Interval syntax is
`every 5m`, `every 2h`, or `daily 09:00`; the minimum interval is five minutes and
the maximum is twenty tasks. Set the process timezone explicitly for daily rules.
There is no cron, weekly, or one-time scheduler in the reference source scope.

The scheduler advances and persists `nextRun` before invoking the runner, uses a
fresh history/permission manager, and coalesces missed ticks. A quiet heartbeat
suppresses only an exact trimmed `HEARTBEAT_OK`; ordinary results are delivered.
The quiet-output rule does not suppress failure replies, but message delivery can
still fail and effects are not exactly-once.

To preapprove one confirm-risk operation, create ignored `.runtime/grants.json`
outside the workspace. Obtain the workspace scope from the local startup log;
substitute your personal private-chat/user IDs and the exact reviewed arguments:

```json
[
  {
    "actor": {
      "chatId": "YOUR_PRIVATE_CHAT_ID",
      "userId": "YOUR_ALLOWED_USER_ID",
      "workspaceId": "YOUR_LOGGED_WORKSPACE_SCOPE"
    },
    "name": "fetch_url",
    "args": { "url": "https://example.com/status" }
  }
]
```

The IDs are placeholders, not valid grants. This JSON is supplied by the user,
never authored by `schedule_task`:

```bash
pnpm bot --grants-file .runtime/grants.json
```

Ask the agent to schedule that exact URL with `allow="fetch_url"`. Matching
requires all actor fields, tool name, and all argument values; changed paths,
contents, URLs, extra arguments, or another owner are denied. A tool-name list
alone is never permission. Read-only tools still pass hard rules; shell, schedule
mutations, recursive delegation, and memory changes remain denied unattended.
Child workers reuse the same owner's authoritative executor: they may perform
only already-granted exact effects and cannot issue or expand grants themselves.
Exact URL approval is not network isolation: DNS and server content may change,
and this fetch adapter does not block private addresses or pin DNS. Review the
destination's trust and avoid company services; production unattended fetch needs
an external network policy in addition to argument matching.

## Architecture Walkthrough

Explain the smallest loop first, then give one concrete failure boundary per
capability. Avoid saying that an approval dialog or a child agent is a sandbox.

1. How does the host prove that a tool result belongs to its declared call?
2. What happens if arguments are invalid, an operation is denied, or the model never finishes?
3. Why do approvals need both trusted identity and exact proposed parameters?
4. How does compression preserve complete tool groups while limiting cost?
5. Why must polling continue while a user approval is pending?
6. Why are a scheduled tool-name allowlist and remembered interactive permissions insufficient?
7. What permissions does a trusted MCP executable have, and why ignore its safety annotations?
8. Why can a plan or parent delegation not authorize a child's side effects?
9. Why are memory and past-message search distinct, and what is not implemented here?
10. Which real integrations and production guarantees still need separate validation?

Use executable demos and negative-path tests as evidence. For production work,
add real token accounting, durable transactional storage, process/container
isolation, provider/channel monitoring, and documented operational policy rather
than pretending this educational runtime already supplies them.
