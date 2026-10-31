# Lesson 07: Scheduled Tasks and Heartbeats

<p align="center"><a href="../../../lessons/07-scheduling/">中文</a> &middot; English</p>

This lesson maps to `lesson-07/scheduler.py` and the scheduling increment in
`bot.py` from the public Nami source. The focus is not building a cron service,
but understanding how an unattended agent persists tasks, limits permissions,
and reduces meaningless notifications.

## Run the Offline Demo First

```bash
pnpm exec tsx lessons/07-scheduling/demo.ts
pnpm exec vitest run lessons/07-scheduling
```

The demo injects a fixture clock, in-memory state, and a fixture runner. It
demonstrates ordinary tasks, quiet heartbeats, exact preauthorization, and
repeated ticks that do not rerun the task. It connects to no model, Telegram,
or real tools.

## Reading Order

1. `time.ts`: `every 30m`, `every 2h`, and `daily 09:00`, with a minimum interval of 5 minutes.
2. `store.ts`: replaceable state storage, writing a temporary JSON file before atomically replacing the target.
3. `scheduler.ts`: creator-isolated tasks, due-time checks, persisting the next run before execution, and unattended approval.
4. `tools.ts`: explicitly register `schedule_task`, `list_tasks`, and `cancel_task`, without import side effects.
5. Compare the tests to understand restart, missed-run, permission, and heartbeat failure paths.

## Scheduling Behavior

At most 20 tasks are stored. Each task keeps its ID, time rule, prompt,
user/chat/workspace, kind, next run time, and exact grants. `daily` uses the
current Node process's local calendar timezone, while timestamps are saved as
UTC ISO strings. Set the process timezone explicitly when deploying; do not
treat the server timezone as the user's timezone. Within the Python source's
scope, this lesson does not support cron, weekly, or one-shot schedules.

If downtime misses several intervals, recovery executes only once. The next
time is calculated from now rather than replaying all missed history. Before
execution, `tick()` persists the new nextRun so a model failure cannot immediately
repeat the same run; overlapping ticks share the same running Promise. A storage
failure prevents execution from starting. History rollback cannot undo tool
effects that already started, and there is no cross-process exactly-once guarantee.

Every run uses a new history with `fresh: true`, without reusing interactive
chat messages or remembered permissions. A `heartbeat` is suppressed only when
its trimmed reply exactly equals `HEARTBEAT_OK`. The same text from an ordinary
task, or a heartbeat with additional explanation, is still sent.

## More Precise Preauthorization Than the Original

The original `allow="fetch_url,write_file"` syntax is retained, but a broad list
of tool names is not execution permission. An unattended side effect also needs
an exact grant issued by the user or application:

```ts
const actor = { chatId: "chat", userId: "learner", workspaceId: "workspace" };
await scheduler.add({
  actor,
  spec: "every 30m",
  prompt: "Read the public status endpoint.",
  allow: "fetch_url",
  grants: [{ actor, name: "fetch_url", args: { url: "https://example.com/status" } }],
});
```

JSON key order may differ, but the tool name, every argument value, and all
three actor identifiers must match exactly. Different URLs, different file
contents, extra arguments, or grants from another user/chat/workspace are
refused. The model's `schedule_task` arguments have no grants field, so it
cannot issue grants to itself. The tool factory can inject `grants(actor, allow)`
to retrieve a human-confirmed scope. A task with only tool names and no grant
may still be created, but confirm-risk side effects will be denied.

Each call checks hard rules, risk level, then the exact grant. `run_shell` and
creating/canceling scheduled tasks are never allowed unattended, preventing
command execution and recursive task expansion. Safe read-only tools must also
pass hard rules. Any failed hard-rule or permission check denies execution.
Keep the execution guards in `PermissionManager` and `ToolRegistry`; a single
check in the scheduler is not enough.

## Storage and Registration

`Scheduler.create()` injects store/now/runner/send/hardRules/riskOf rather than
depending on real environment variables or a global CURRENT. `JsonTaskStore`
requires a state directory outside the agent workspace, refuses symbolic links
and multiple hard links, and checks and reads through the same no-follow file
handle. Both reading and writing have a 1 MB UTF-8 byte budget. Files are written
with mode `0600`; the temporary file and existing target also have their link
counts checked before replacement. This avoids atomically replacing the old
state while leaving a workspace hard link that becomes an ordinarily readable
file. Production integration uses lesson 04's state directory. Runtime state,
prompts, grants, and real user data must not be committed to Git.

`list(actor)` and `remove(id, actor)` both check user/chat/workspace. Registration
marks creation and cancellation tools as `confirm` and listing as `safe`; the
caller supplies a stable actor getter the model cannot rewrite. Multiple
processes sharing a state file need additional database transactions or a
process lock. This lesson only guarantees single-process queuing and atomic
file replacement; it is not an OS sandbox.

## Understanding Check

Explain why nextRun is saved first, why missed runs are not all replayed, how
heartbeats reduce noise, why task permission cannot expand indefinitely from a
tool name, and why both actor checks and workspace hard rules are indispensable.
These points explain an unattended agent's reliability and security boundaries.
