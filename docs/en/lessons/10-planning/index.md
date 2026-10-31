# Lesson 10: Todos And Approved Execution Plans

<p align="center"><a href="../../../lessons/10-planning/">中文</a> &middot; English</p>

Two concepts share a name but solve different problems. `update_plan` is a
short-lived todo list that keeps the agent on track. Plan mode is an
authorization boundary: investigate first, show an execution plan to the
human, then unlock side effects only after fresh approval.

```sh
pnpm exec tsx lessons/10-planning/demo.ts
pnpm exec vitest run lessons/10-planning
```

The offline demo has an explicit callback approving one constant example plan;
it does not modify project files. Production callers must provide an actual
human approval UI rather than copying that demo callback.

## Integration

Create one `PlanningState` per session. A user command calls
`state.enterPlanMode(task)`; entering or leaving plan mode is not a general
model-controlled setter. `createPlanningTools(state, { approvePlan, messages })`
returns the two tool definitions. The `submit_plan` factory performs its own
fresh approval, so the outer permission layer should enforce hard rules without
asking a second time for this tool. Its risk metadata remains `confirm`.

`state.checkTool(name, risk, args)` is the hard mode decision to run **before**
ordinary side-effect approval. Unknown risks and unaudited MCP tools are denied
in plan mode even if an earlier session allowed them. Worker delegation is
refused; read-only children can still investigate. Use the lesson-09
`isReadOnly` callback too, so children inherit restrictions for their lifetime.

Register each tool through `protectPlanningTool(definition, state)` to recheck
the mode immediately before its implementation runs, including after a pending
asynchronous approval. Pass `guardPlanningTools(registry, state)` to the loop to
hide unavailable schemas **and** reject forged calls. The original registry
still provides validation, owner checks, and per-tool approvals. Approving an
execution plan does not grant a blanket write or shell permission.

Todo input is bounded, validated, and snapshot-cloned; only one step may be
`in_progress`. Updating it compacts old plan tool results without deleting
call/result pairs or unrelated text. Rejected or failed approval keeps plan
mode on. A changed task or todo revision invalidates pending approval, so a
stale click cannot unlock a new task.

## Understanding Check

Explain why telling a model "do not write" is not a permission boundary, why
schema filtering alone is insufficient, why cached approval cannot override a
mode restriction, and why a todo list is not evidence that a plan was approved.
