# Learning Through Commits

<p align="center"><a href="../../../guides/learning-path/">中文</a> &middot; English</p>

Read a commit's diff, run that lesson's demo/tests, and explain its invariant before
moving on. This is an architectural port, not line-by-line Python syntax practice.
The shared runtime is deliberately assembled last so each earlier diff introduces
one capability with its own tests and documentation.

| Commit subject | Question to answer |
| --- | --- |
| `chore(workspace): bootstrap the TypeScript learning project` | How do credentials, local data, and public dependencies stay out of Git? |
| `feat(lesson-01): add validated file and shell tools` | How does ordinary code become a model-callable tool? |
| `feat(lesson-01): implement the minimal agent loop` | Who executes tools, returns observations, and stops the loop? |
| `fix(lesson-01): harden file boundaries and bounded reads` | Why are symlinks, hardlinks, and read limits part of the tool boundary? |
| `fix(lesson-01): reject malformed replies before tool execution` | Why must a complete reply be checked before any tool side effect? |
| `feat(lesson-02): build a validated tool registry and chat loop` | How do schemas, implementations, and multiple turns fit together? |
| `feat(lesson-03): enforce scoped tool permissions` | Why can user approval never override a hard rule? |
| `feat(lesson-04): manage context and persist sessions` | What can be compacted without breaking tool-call groups? |
| `feat(lesson-05): discover and load workspace skills` | Why load descriptions eagerly but instruction bodies lazily? |
| `feat(lesson-06): add an allowlisted Telegram channel` | How can a bot receive approval while a model turn is waiting? |
| `feat(lesson-07): schedule scoped tasks and quiet heartbeats` | How are restart behavior, quiet checks, and unattended permissions different? |
| `feat(lesson-08): connect trusted stdio MCP servers` | Why are discovery, executable trust, and tool approval separate? |
| `feat(lesson-09): delegate isolated and read-only child tasks` | What does a child isolate, and what must remain host-enforced? |
| `feat(lesson-10): enforce reviewed plans and task progress` | Why does approving a plan not approve its individual side effects? |
| `feat(lesson-11): persist approved memory and search sessions` | Why are stable facts, session history, and search different stores? |
| `feat(app): compose the full course runtime and learning CLI` | Where should lifecycle, identity, and dependency wiring live? |

```bash
git log --reverse --oneline
git show <commit>
pnpm lesson:04:demo
pnpm exec vitest run lessons/04-context
pnpm check
```

Each lesson README gives a reading order, a Python-to-TS mapping, failure paths,
and understanding checks. At an earlier commit, package aliases added by the final
runtime commit are not yet available; use `pnpm exec tsx lessons/NN-name/demo.ts`
and that lesson's test path instead. The original lesson-01 demo requires an
interactive confirmation before its real shell operation.

## Recommended Practice

Start at 01-03 and draw the exact sequence: model request, proposed tool call,
runtime validation, permission, execution, observation, next model request.
Use 04-05 to reason about context cost and instructions. Then add 06-07 to move
from a one-shot CLI to a stateful, unattended application. Finally work through
08-11 to explain extensibility, bounded delegation, reviewed execution, and memory.

For each stage, deliberately trigger one refusal and one failure. Check that
invalid arguments never reach a tool, that denied operations have no side effect,
and that a malformed or failing request does not corrupt saved conversation groups.
Do not start with a large framework or UI that hides these boundaries.

After the full runtime commit, use `pnpm agent -- --lesson N --demo` to see the
cumulative composition through N, and `pnpm demos` to revisit standalone examples.
For a real model, supply only personal credentials in ignored configuration.
Record real provider/channel behavior separately from deterministic demo results.

Use the [feature map](../course-map/index.md) as your completion checklist and
[architecture guide](../architecture/index.md) to prepare an architecture explanation that
covers tradeoffs and limits, not just happy-path API calls.
