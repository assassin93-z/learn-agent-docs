# Lesson 11: Human-Approved Memory And History Search

<p align="center"><a href="../../../lessons/11-memory/">中文</a> &middot; English</p>

The Python reference distinguishes stable facts from past conversation text.
Long-term memory is a tiny `MEMORY.md` snapshot added once at the start of a new
session. Saved conversations remain outside the prompt until a keyword search
returns a bounded snippet. Neither mechanism silently captures the workspace.

```sh
pnpm exec tsx lessons/11-memory/demo.ts
pnpm exec vitest run lessons/11-memory
```

The offline demo uses an external temporary state directory, an explicit
approval of one synthetic fact, and a synthetic lesson-04 transcript. It removes
its state afterward and requires neither a model key nor network access.

## Integration

Create `MemoryStore({ stateDir, workspace, approve })` with a private, external,
untracked state directory. It uses the same `stateDir/sessions/*.json` pure
message arrays as lesson 04. Keep state separated per user/owner in a multi-user
deployment; sharing a directory would share its memory and search corpus.

`createMemoryTools(store)` returns `remember` and `search_sessions`.
`remember` retains risk `confirm`, but its implementation asks `approve` freshly
for **every** actual add, replace, or removal. The callback sees the exact fact,
matched prior entry, and resulting character count. The outer registry should
apply hard mode and owner rules without asking twice for this tool. Never grant
it unattended approval or expose it to children. Lesson-09 children exclude it;
lesson-10 plan mode blocks it.

Call `await store.memorySection()` only when constructing a new session system
prompt. It returns immutable text marking facts as background, not instructions;
current user requests and tool permissions take precedence. Later writes affect
the next session, not the current snapshot. The budget is 2000 characters, with
one normalized line per fact and a 512-character per-entry bound.

State paths are canonicalized and checked against the workspace. Reads require
bounded regular files, reject symlinks and multiply hard-linked aliases, and validate memory/transcript
formats. Writes use a unique temporary file, private file permissions, a lock,
and atomic rename. Proposals are serialized in-process; changed memory after an
approval is rejected rather than silently rebased. A process interrupted while
holding `MEMORY.lock` may require the operator to inspect and remove that stale
lock; the agent never guesses that another process's lock is safe to delete.

`searchSessions` requires all case-insensitive keywords to match one user or
assistant message. It excludes system prompts and tool results, skips invalid
files and labels, returns at most five short snippets, and bounds files examined,
directory enumeration, and bytes read. Recency ordering applies within the
bounded candidate set; a scan-limit marker reports potentially omitted history.
It never saves a search hit into memory without a separate approved proposal.

## Understanding Check

Explain why memory is not conversation history, why each fact needs explicit
approval, why transient task progress does not belong in every future prompt,
why full-history injection grows costs, and how stale approvals and concurrent
writes can corrupt supposedly simple local storage.
