# Lesson 09: Independent Child Agents

<p align="center"><a href="../../../lessons/09-subagents/">中文</a> &middot; English</p>

The Python reference introduces independent sessions for bounded sub-tasks.
TypeScript implements the same boundary using explicit dependencies rather than
global current-session state. A child has its own system prompt, task, history,
tool set, and maximum 15 model rounds. Only a bounded conclusion returns to the
parent; large intermediate file reads stay in the child's context.

```sh
pnpm exec tsx lessons/09-subagents/demo.ts
pnpm exec vitest run lessons/09-subagents
```

The offline demo uses an injected deterministic model. The tests additionally
prove that actual tool results and parent history do not cross the boundary.

`createSubagentTools({ client, registry, isReadOnly, ... })` returns `delegate`
and `delegate_parallel`. Register these only for the parent. `explore` is the
default and receives only explicitly `safe` definitions. `worker` can access
other tools, but each call is routed through the **original registry executor**,
including its validation, owner checks, hard rules, and approval callback.
Approval to delegate is never approval to write files.

Children cannot delegate again, manage scheduled tasks, modify the parent's
plan, approve an execution plan, or remember facts. Parallel delegation supports
one to three read-only children, preserves task order, and bounds aggregate
concurrency even if the factory is called by multiple consumers. Workers must
run alone. Result text is clipped, and one child error does not erase sibling
results or expose provider exceptions.

## Plan Mode

Pass `isReadOnly: () => planningState.mode === "plan"` when adding lesson 10.
A child created in plan mode stays read-only even if the parent later unlocks.
The wrapper rechecks restrictions at execution time, so entering plan mode
after a model request still blocks a previously advertised write. Unknown MCP
effects are never available to explorers, even if a server labels them
read-only; only your reviewed safe-tool configuration is trusted.

## Understanding Check

Explain why a child is a context boundary but not automatically an OS sandbox,
why descriptions alone cannot restrict tools, when parallel investigations are
safe, and how the parent executor prevents delegation from becoming a privilege
escalation path. A single model client can serve multiple asynchronous children;
each request must remain independent and the client must support concurrent use.
